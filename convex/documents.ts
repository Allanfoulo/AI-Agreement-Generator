import { internalQuery, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { content, documentType } from './validators';
import { requireDevelopment, recordEvent } from './events';
import { calculateFinancialDocument } from '../src/domain/financial/money';
import { assertTransition, type DocumentStatus } from '../src/domain/documents/lifecycle';
import { internal } from './_generated/api';
import { emptyProfile } from './workspace';
import { normalizeTemplateKey } from '../src/pdf/templates/template-registry';

export const list = query({ args: {}, handler: async ctx => { requireDevelopment(); return (await ctx.db.query('documents').order('desc').take(500)).filter(d => !d.archived); } });
export const versions = query({ args: { id: v.id('documents') }, handler: async (ctx, { id }) => { requireDevelopment(); return ctx.db.query('versions').withIndex('by_document', q => q.eq('documentId', id)).collect(); } });
export const sectionForAgent = internalQuery({ args: { id: v.id('documents'), heading: v.string() }, handler: async (ctx, { id, heading }) => {
  const doc = await ctx.db.get(id); if (!doc || doc.archived) return null;
  const section = doc.content.sections.find(item => item.heading.toLowerCase() === heading.trim().toLowerCase());
  return section ? { documentId: id, heading: section.heading, body: section.body } : null;
}});
export const save = mutation({ args: { id: v.optional(v.id('documents')), type: documentType, content, expectedRevision: v.number(), requestKey: v.string() }, handler: async (ctx, args) => {
  requireDevelopment();
  const fingerprint = JSON.stringify(args);
  const prior = await ctx.db.query('requests').withIndex('by_key', q => q.eq('key', args.requestKey)).unique();
  if (prior) { if (prior.fingerprint !== fingerprint) throw new Error('Request key reused with different input.'); return prior.result; }
  const old = args.id ? await ctx.db.get(args.id) : null;
  if (args.id && !old) throw new Error('Document not found.');
  if (old && (old.status !== 'draft' || old.type !== args.type)) throw new Error('Only drafts of the same type can be edited.');
  if ((old?.revision ?? 0) !== args.expectedRevision) throw new Error('Document changed. Reload before saving.');
  if (!args.content.title.trim() || !args.content.recipientId.trim()) throw new Error('Title and recipient are required.');
  const financial = args.type === 'quote' || args.type === 'invoice';
  const totalMinor = financial ? calculateFinancialDocument({ currency: args.content.currency, lines: args.content.lines, depositBasisPoints: args.content.depositBasisPoints }).totalMinor : 0;
  const normalizedContent = { ...args.content, templateKey: normalizeTemplateKey(args.type, args.content.templateKey) };
  const data = { type: args.type, content: normalizedContent, totalMinor, revision: args.expectedRevision + 1 };
  const id = old ? old._id : await ctx.db.insert('documents', { ...data, status: 'draft', amountPaidMinor: 0, archived: false, createdAt: Date.now() });
  if (old) await ctx.db.patch(id, data);
  await ctx.db.insert('requests', { key: args.requestKey, fingerprint, result: id });
  await recordEvent(ctx, old ? 'DocumentDraftUpdated' : 'DocumentDraftCreated', id, args.requestKey);
  return id;
}});
export const issue = mutation({ args: { id: v.id('documents'), expectedRevision: v.number() }, handler: async (ctx, { id, expectedRevision }) => {
  requireDevelopment();
  const doc = await ctx.db.get(id);
  if (!doc || doc.revision !== expectedRevision || doc.status !== 'draft') throw new Error('Only the current draft can be issued.');
  const company = (await ctx.db.query('workspace').withIndex('by_key', q => q.eq('key', 'default')).unique())?.profile ?? emptyProfile;
  if (!company.companyName.trim()) throw new Error('Complete the company profile first.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.content.issueDate) || !Number.isFinite(Date.parse(doc.content.issueDate))) throw new Error('Valid issue date required.');
  if (doc.content.dueDate && doc.content.dueDate < doc.content.issueDate) throw new Error('Due date precedes issue date.');
  if (doc.content.validUntil && doc.content.validUntil < doc.content.issueDate) throw new Error('Validity date precedes issue date.');
  if (doc.content.sections.some(s => /\[\[.*?\]\]/.test(s.body))) throw new Error('Resolve draft placeholders before issue.');
  const client = await ctx.db.query('clients').withIndex('by_external', q => q.eq('data.id', doc.content.recipientId)).unique();
  const employeeId = ctx.db.normalizeId('employees', doc.content.recipientId);
  const employee = employeeId ? await ctx.db.get(employeeId) : null;
  if (doc.type === 'employee_letter' ? !employee : !client) throw new Error('Recipient no longer exists.');
  const recipient = doc.type === 'employee_letter' ? { name: employee!.name, company: employee!.position, address: '' } : { name: client!.data.name, company: client!.data.company, address: client!.data.address };
  const sequence = await ctx.db.query('sequences').withIndex('by_type', q => q.eq('type', doc.type)).unique();
  const next = sequence?.next ?? 1;
  if (sequence) await ctx.db.patch(sequence._id, { next: next + 1 }); else await ctx.db.insert('sequences', { type: doc.type, next: next + 1 });
  const number = `${{ quote: 'QT', invoice: 'INV', sla: 'SLA', employee_letter: 'HR' }[doc.type]}-${String(next).padStart(6, '0')}`;
  const revision = doc.revision + 1;
  await ctx.db.patch(id, { number, revision, status: doc.type === 'sla' ? 'awaiting_signature' : 'issued' });
  const versionId = await ctx.db.insert('versions', { documentId: id, revision, snapshot: doc.content, company, recipient, number, totalMinor: doc.totalMinor, createdAt: Date.now() });
  const jobId = await ctx.db.insert('jobs', { versionId, status: 'queued', attempts: 0, createdAt: Date.now() });
  await ctx.scheduler.runAfter(0, internal.pdfRender.run, { jobId });
  await recordEvent(ctx, 'DocumentIssued', id);
  return number;
}});
export const transition = mutation({ args: { id: v.id('documents'), status: v.string(), expectedRevision: v.number() }, handler: async (ctx, args) => {
  requireDevelopment(); const doc = await ctx.db.get(args.id);
  if (!doc || doc.revision !== args.expectedRevision) throw new Error('Document changed.');
  if (['issued', 'paid', 'partially_paid', 'converted'].includes(args.status) || doc.status === 'draft') throw new Error('Use the dedicated command for this transition.');
  assertTransition(doc.type, doc.status as DocumentStatus, args.status as DocumentStatus);
  await ctx.db.patch(doc._id, { status: args.status, revision: doc.revision + 1 });
  await recordEvent(ctx, 'DocumentStatusChanged', doc._id);
}});
export const payment = mutation({ args: { id: v.id('documents'), amountMinor: v.number(), requestKey: v.string() }, handler: async (ctx, args) => {
  requireDevelopment(); const fingerprint = JSON.stringify(args);
  const prior = await ctx.db.query('requests').withIndex('by_key', q => q.eq('key', args.requestKey)).unique();
  if (prior) { if (prior.fingerprint !== fingerprint) throw new Error('Request key conflict.'); return; }
  const doc = await ctx.db.get(args.id);
  if (!doc || doc.type !== 'invoice' || ['draft', 'void', 'paid'].includes(doc.status)) throw new Error('Invoice cannot receive payments.');
  if (!Number.isSafeInteger(args.amountMinor) || args.amountMinor <= 0 || doc.amountPaidMinor + args.amountMinor > doc.totalMinor) throw new Error('Invalid payment amount.');
  const amountPaidMinor = doc.amountPaidMinor + args.amountMinor;
  await ctx.db.patch(doc._id, { amountPaidMinor, status: amountPaidMinor === doc.totalMinor ? 'paid' : 'partially_paid', revision: doc.revision + 1 });
  await ctx.db.insert('requests', { key: args.requestKey, fingerprint, result: doc._id });
  await recordEvent(ctx, 'InvoicePaymentRecorded', doc._id, args.requestKey);
}});
export const convert = mutation({ args: { id: v.id('documents'), basisPoints: v.number(), requestKey: v.string(), templateKey: v.optional(v.string()) }, handler: async (ctx, args) => {
  requireDevelopment(); const fingerprint = JSON.stringify(args);
  const prior = await ctx.db.query('requests').withIndex('by_key', q => q.eq('key', args.requestKey)).unique();
  if (prior) { if (prior.fingerprint !== fingerprint) throw new Error('Request key conflict.'); return prior.result; }
  const quote = await ctx.db.get(args.id);
  if (!quote || quote.type !== 'quote' || quote.status !== 'accepted') throw new Error('An accepted quote is required.');
  if (!Number.isInteger(args.basisPoints) || args.basisPoints < 1 || args.basisPoints > 10000) throw new Error('Invalid percentage.');
  const amount = Math.floor(quote.totalMinor * args.basisPoints / 10000 + 0.5);
  const existing = await ctx.db.query('documents').withIndex('by_source', q => q.eq('sourceId', args.id)).collect();
  if (existing.filter(d => d.status !== 'void').reduce((sum, d) => sum + d.totalMinor, 0) + amount > quote.totalMinor) throw new Error('Conversion would exceed the accepted quote total.');
  const id = await ctx.db.insert('documents', { type: 'invoice', content: { ...quote.content, title: `Invoice: ${quote.content.title}`, lines: [{ id: 'conversion', name: `${args.basisPoints / 100}% of ${quote.number}`, quantityMilli: 1000, unitPriceMinor: amount }], depositBasisPoints: 0, templateKey: normalizeTemplateKey('invoice', args.templateKey ?? quote.content.templateKey) }, status: 'draft', revision: 1, totalMinor: amount, amountPaidMinor: 0, sourceId: quote._id, archived: false, createdAt: Date.now() });
  await ctx.db.insert('requests', { key: args.requestKey, fingerprint, result: id });
  await recordEvent(ctx, 'QuoteConvertedToInvoiceDraft', id, args.requestKey); return id;
}});
