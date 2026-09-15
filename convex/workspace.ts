import { internalQuery, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { profile, recipient, client, itemPackage, legacySet } from './validators';
import { recordEvent, requireDevelopment } from './events';

export const emptyProfile = { repName: '', repTitle: '', companyName: '', address: '', phone: '', email: '', bankName: '', accountName: '', accountNumber: '', branchCode: '', accountType: '', swiftCode: '' };
export const read = query({ args: {}, handler: async ctx => {
  requireDevelopment();
  const workspace = await ctx.db.query('workspace').withIndex('by_key', q => q.eq('key', 'default')).unique();
  return { profile: workspace?.profile ?? emptyProfile, recipient: workspace?.recipient ?? { name: '', company: '', address: '' }, logo: workspace?.logo ?? null, revision: workspace?.revision ?? 0,
    clients: (await ctx.db.query('clients').take(1000)).map(r => r.data), packages: (await ctx.db.query('packages').take(1000)).map(r => r.data),
    documents: (await ctx.db.query('legacyDocuments').order('desc').take(1000)).filter(r => !r.archived).map(r => ({ ...r.data, revision: r.revision })) };
}});
export const searchClients = internalQuery({ args: { query: v.string(), limit: v.number() }, handler: async (ctx, args) => {
  const needle = args.query.trim().toLowerCase();
  const rows = await ctx.db.query('clients').take(1000);
  return rows.filter(row => !needle || `${row.data.id} ${row.data.name} ${row.data.company} ${row.data.address}`.toLowerCase().includes(needle)).slice(0, Math.min(Math.max(args.limit, 1), 10)).map(row => ({ id: row.data.id, name: row.data.name, company: row.data.company, address: row.data.address }));
}});
export const searchEmployees = internalQuery({ args: { query: v.string(), limit: v.number() }, handler: async (ctx, args) => {
  const needle = args.query.trim().toLowerCase();
  const rows = await ctx.db.query('employees').take(1000);
  return rows.filter(row => !row.archived && (!needle || `${row._id} ${row.name} ${row.position} ${row.email}`.toLowerCase().includes(needle))).slice(0, Math.min(Math.max(args.limit, 1), 10)).map(row => ({ id: row._id, name: row.name, position: row.position, email: row.email }));
}});
export const listServices = internalQuery({ args: { query: v.string(), currency: v.optional(v.string()), limit: v.number() }, handler: async (ctx, args) => {
  const needle = args.query.trim().toLowerCase();
  const rows = await ctx.db.query('services').take(1000);
  return rows.filter(row => !row.archived && (!args.currency || row.currency === args.currency) && (!needle || `${row._id} ${row.name} ${row.description}`.toLowerCase().includes(needle))).slice(0, Math.min(Math.max(args.limit, 1), 10)).map(row => ({ id: row._id, name: row.name, description: row.description, currency: row.currency }));
}});
export const safeCompanyDefaults = internalQuery({ args: {}, handler: async ctx => {
  const row = await ctx.db.query('workspace').withIndex('by_key', q => q.eq('key', 'default')).unique();
  return row ? { companyName: row.profile.companyName, representative: row.profile.repName, representativeTitle: row.profile.repTitle, address: row.profile.address } : { companyName: '', representative: '', representativeTitle: '', address: '' };
}});
export const update = mutation({ args: { profile: v.optional(profile), recipient: v.optional(recipient), logo: v.optional(v.union(v.string(), v.null())), expectedRevision: v.number() }, handler: async (ctx, args) => {
  requireDevelopment();
  const row = await ctx.db.query('workspace').withIndex('by_key', q => q.eq('key', 'default')).unique();
  if ((row?.revision ?? 0) !== args.expectedRevision) throw new Error('Workspace changed. Reload and retry.');
  if (args.logo && args.logo.length > 500000) throw new Error('Logo must be smaller than 500 KB.');
  const data = { key: 'default', profile: args.profile ?? row?.profile ?? emptyProfile, recipient: args.recipient ?? row?.recipient ?? { name: '', company: '', address: '' }, logo: args.logo === undefined ? row?.logo ?? null : args.logo, revision: args.expectedRevision + 1 };
  if (row) await ctx.db.patch(row._id, data); else await ctx.db.insert('workspace', data);
  await recordEvent(ctx, 'WorkspaceUpdated', 'default');
}});
export const saveClient = mutation({ args: { data: client }, handler: async (ctx, { data }) => {
  requireDevelopment();
  if (!data.name.trim() || !data.company.trim()) throw new Error('Client name and company are required.');
  const row = await ctx.db.query('clients').withIndex('by_external', q => q.eq('data.id', data.id)).unique();
  if (row) await ctx.db.patch(row._id, { data }); else await ctx.db.insert('clients', { data });
  await recordEvent(ctx, 'ClientSaved', data.id);
}});
export const deleteClient = mutation({ args: { id: v.string() }, handler: async (ctx, { id }) => {
  requireDevelopment();
  const row = await ctx.db.query('clients').withIndex('by_external', q => q.eq('data.id', id)).unique();
  if (row) { await ctx.db.delete(row._id); await recordEvent(ctx, 'ClientDeleted', id); }
}});
export const savePackage = mutation({ args: { data: itemPackage }, handler: async (ctx, { data }) => {
  requireDevelopment();
  if (!data.name.trim() || !data.items.length || data.items.some(i => !Number.isFinite(i.price) || i.price < 0)) throw new Error('Invalid package.');
  const row = await ctx.db.query('packages').withIndex('by_external', q => q.eq('data.id', data.id)).unique();
  if (row) await ctx.db.patch(row._id, { data }); else await ctx.db.insert('packages', { data });
  await recordEvent(ctx, 'PackageSaved', data.id);
}});
export const deletePackage = mutation({ args: { id: v.string() }, handler: async (ctx, { id }) => {
  requireDevelopment();
  const row = await ctx.db.query('packages').withIndex('by_external', q => q.eq('data.id', id)).unique();
  if (row) { await ctx.db.delete(row._id); await recordEvent(ctx, 'PackageDeleted', id); }
}});
export const saveLegacy = mutation({ args: { data: legacySet, expectedRevision: v.number() }, handler: async (ctx, { data, expectedRevision }) => {
  requireDevelopment();
  const row = await ctx.db.query('legacyDocuments').withIndex('by_external', q => q.eq('data.id', data.id)).unique();
  if ((row?.revision ?? 0) !== expectedRevision) throw new Error('Document changed. Reload before saving.');
  if (!data.documents.length || JSON.stringify(data).length > 500000) throw new Error('Document is empty or too large.');
  if (row) await ctx.db.patch(row._id, { data, revision: expectedRevision + 1 });
  else await ctx.db.insert('legacyDocuments', { data, revision: 1, archived: false });
  await recordEvent(ctx, 'LegacyDocumentSaved', data.id);
}});
export const archiveLegacy = mutation({ args: { id: v.string() }, handler: async (ctx, { id }) => {
  requireDevelopment();
  const row = await ctx.db.query('legacyDocuments').withIndex('by_external', q => q.eq('data.id', id)).unique();
  if (row) { await ctx.db.patch(row._id, { archived: true }); await recordEvent(ctx, 'LegacyDocumentArchived', id); }
}});
