import { internalMutation, query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { requireDevelopment, recordEvent } from './events';
export const claim = internalMutation({ args: { jobId: v.id('jobs') }, handler: async (ctx, { jobId }) => {
  const job = await ctx.db.get(jobId);
  if (!job || job.status === 'completed' || job.status === 'processing') return null;
  const version = await ctx.db.get(job.versionId);
  if (!version) return null;
  const document = await ctx.db.get(version.documentId);
  if (!document) return null;
  await ctx.db.patch(jobId, { status: 'processing', attempts: job.attempts + 1 });
  return { version, type: document.type };
} });
export const finish = internalMutation({ args: { jobId: v.id('jobs'), storageId: v.optional(v.id('_storage')), checksum: v.optional(v.string()), pageCount: v.optional(v.number()), failed: v.boolean() }, handler: async (ctx, args) => {
  const job = await ctx.db.get(args.jobId); if (!job || job.status === 'completed') return;
  if (args.failed) { await ctx.db.patch(job._id, { status: 'failed', error: 'PDF_RENDER_FAILED' }); if (job.attempts < 3) await ctx.scheduler.runAfter(1000 * 2 ** job.attempts, internal.pdfRender.run, { jobId: job._id }); }
  else { await ctx.db.patch(job._id, { status: 'completed', storageId: args.storageId, checksum: args.checksum, pageCount: args.pageCount }); await recordEvent(ctx, 'RenderCompleted', job.versionId); }
}});
export const list = query({ args: {}, handler: async ctx => {
  requireDevelopment();
  return Promise.all((await ctx.db.query('jobs').order('desc').take(100)).map(async job => {
    const version = await ctx.db.get(job.versionId);
    return {
      ...job,
      documentId: version?.documentId ?? null,
      documentNumber: version?.number ?? null,
      versionNumber: version?.revision ?? null,
      url: job.storageId ? await ctx.storage.getUrl(job.storageId) : null,
    };
  }));
} });
export const retry = mutation({ args: { jobId: v.id('jobs') }, handler: async (ctx, { jobId }) => { requireDevelopment(); const job = await ctx.db.get(jobId); if (!job || job.status !== 'failed') throw new Error('Only failed jobs can be retried.'); await ctx.db.patch(jobId, { status: 'queued', attempts: 0 }); await ctx.scheduler.runAfter(0, internal.pdfRender.run, { jobId }); } });
