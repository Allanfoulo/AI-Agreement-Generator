import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { client, itemPackage, legacySet, profile, recipient } from './validators';
import { recordEvent, requireDevelopment } from './events';
export const legacy = mutation({ args: { key: v.string(), dryRun: v.boolean(), clients: v.array(client), packages: v.array(itemPackage), documents: v.array(legacySet), profile: v.optional(profile), recipient: v.optional(recipient), logo: v.optional(v.string()), invoiceCounter: v.number(), quoteCounter: v.number() }, handler: async (ctx, args) => {
  requireDevelopment();
  if (JSON.stringify(args).length > 700000) throw new Error('Import exceeds 700 KB. Split the export into smaller files.');
  for (const next of [args.invoiceCounter, args.quoteCounter]) if (!Number.isSafeInteger(next) || next < 1) throw new Error('Invalid legacy counter.');
  const count = args.clients.length + args.packages.length + args.documents.length;
  const previous = await ctx.db.query('imports').withIndex('by_key', q => q.eq('key', args.key)).unique();
  if (previous) return { count: previous.count, alreadyImported: true };
  if (args.dryRun) return { count, alreadyImported: false };
  for (const data of args.clients) { const existing = await ctx.db.query('clients').withIndex('by_external', q => q.eq('data.id', data.id)).unique(); if (!existing) await ctx.db.insert('clients', { data }); }
  for (const data of args.packages) { const existing = await ctx.db.query('packages').withIndex('by_external', q => q.eq('data.id', data.id)).unique(); if (!existing) await ctx.db.insert('packages', { data }); }
  for (const data of args.documents) { const existing = await ctx.db.query('legacyDocuments').withIndex('by_external', q => q.eq('data.id', data.id)).unique(); if (!existing) await ctx.db.insert('legacyDocuments', { data, revision: 1, archived: false }); }
  const workspace = await ctx.db.query('workspace').withIndex('by_key', q => q.eq('key', 'default')).unique();
  if (!workspace && args.profile) await ctx.db.insert('workspace', { key: 'default', profile: args.profile, recipient: args.recipient ?? { name: '', company: '', address: '' }, logo: args.logo ?? null, revision: 1 });
  for (const [type, next] of [['invoice', args.invoiceCounter], ['quote', args.quoteCounter]] as const) { const row = await ctx.db.query('sequences').withIndex('by_type', q => q.eq('type', type)).unique(); if (!row) await ctx.db.insert('sequences', { type, next }); else if (next > row.next) await ctx.db.patch(row._id, { next }); }
  await ctx.db.insert('imports', { key: args.key, count, completedAt: Date.now() }); await recordEvent(ctx, 'LegacyImportCompleted', args.key); return { count, alreadyImported: false };
}});
