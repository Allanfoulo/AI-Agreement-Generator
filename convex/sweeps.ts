import { internalMutation } from './_generated/server';
import { recordEvent } from './events';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const run = internalMutation({ args: {}, handler: async ctx => {
  const now = today();
  const documents = await ctx.db.query('documents').collect();
  let changed = 0;
  for (const doc of documents) {
    if (doc.archived || doc.status === 'draft' || doc.status === 'void') continue;
    const expired = doc.content.validUntil && doc.content.validUntil < now && ['issued', 'sent', 'viewed'].includes(doc.status);
    const overdue = doc.type === 'invoice' && doc.content.dueDate && doc.content.dueDate < now && ['issued', 'partially_paid'].includes(doc.status);
    if (expired) { await ctx.db.patch(doc._id, { status: 'expired', revision: doc.revision + 1 }); await recordEvent(ctx, 'DocumentExpired', doc._id); changed++; }
    else if (overdue) { await ctx.db.patch(doc._id, { status: 'overdue', revision: doc.revision + 1 }); await recordEvent(ctx, 'InvoiceOverdue', doc._id); changed++; }
  }
  return { changed };
}});
