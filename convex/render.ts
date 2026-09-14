import { internalAction, internalMutation, internalQuery, query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { requireDevelopment, recordEvent } from './events';
export const claim = internalMutation({ args: { jobId: v.id('jobs') }, handler: async (ctx, { jobId }) => { const job = await ctx.db.get(jobId); if (!job || job.status === 'completed' || job.status === 'processing') return null; await ctx.db.patch(jobId, { status: 'processing', attempts: job.attempts + 1 }); return ctx.db.get(job.versionId); } });
export const finish = internalMutation({ args: { jobId: v.id('jobs'), storageId: v.optional(v.id('_storage')), checksum: v.optional(v.string()), pageCount: v.optional(v.number()), failed: v.boolean() }, handler: async (ctx, args) => {
  const job = await ctx.db.get(args.jobId); if (!job || job.status === 'completed') return;
  if (args.failed) { await ctx.db.patch(job._id, { status: 'failed', error: 'PDF_RENDER_FAILED' }); if (job.attempts < 3) await ctx.scheduler.runAfter(1000 * 2 ** job.attempts, internal.render.run, { jobId: job._id }); }
  else { await ctx.db.patch(job._id, { status: 'completed', storageId: args.storageId, checksum: args.checksum, pageCount: args.pageCount }); await recordEvent(ctx, 'RenderCompleted', job.versionId); }
}});
export const run = internalAction({ args: { jobId: v.id('jobs') }, handler: async (ctx, { jobId }) => {
  const version = await ctx.runMutation(internal.render.claim, { jobId }); if (!version) return;
  try {
    const pdf = await PDFDocument.create(); const font = await pdf.embedFont(StandardFonts.Helvetica);
    let page = pdf.addPage([595.28, 841.89]); let y = 790;
    const write = (text: string) => {
      // Standard PDF font supports Latin text; reject unsupported glyphs visibly.
      const words = text.split(/\s+/); let line = '';
      for (const word of words) {
        const parts = word.match(/.{1,75}/g) ?? [''];
        for (const part of parts) {
          if (font.widthOfTextAtSize(`${line} ${part}`, 11) > 490 && line) { draw(line); line = part; } else line = `${line} ${part}`.trim();
        }
      }
      if (line) draw(line); y -= 8;
    };
    const draw = (text: string) => { if (y < 55) { page = pdf.addPage([595.28, 841.89]); y = 790; } page.drawText(text, { x: 50, y, font, size: 11 }); y -= 16; };
    write(version.company.companyName); write(version.company.address); write(version.number); write(version.snapshot.title); write(version.snapshot.issueDate);
    write(`${version.recipient.name} — ${version.recipient.company}`); write(version.recipient.address);
    for (const line of version.snapshot.lines) write(`${line.name}: ${line.quantityMilli / 1000} x ${(line.unitPriceMinor / 100).toFixed(2)} ${version.snapshot.currency}`);
    write(`Total: ${(version.totalMinor / 100).toFixed(2)} ${version.snapshot.currency}`);
    for (const section of version.snapshot.sections) { write(section.heading); write(section.body); }
    pdf.setTitle(version.snapshot.title); pdf.setSubject(`Version ${version.revision}`);
    const bytes = await pdf.save(); const hash = await crypto.subtle.digest('SHA-256', bytes); const checksum = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const storageId = await ctx.storage.store(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
    await ctx.runMutation(internal.render.finish, { jobId, storageId, checksum, pageCount: pdf.getPageCount(), failed: false });
  } catch { await ctx.runMutation(internal.render.finish, { jobId, failed: true }); }
}});
export const list = query({ args: {}, handler: async ctx => { requireDevelopment(); return Promise.all((await ctx.db.query('jobs').order('desc').take(100)).map(async job => ({ ...job, url: job.storageId ? await ctx.storage.getUrl(job.storageId) : null }))); } });
export const retry = mutation({ args: { jobId: v.id('jobs') }, handler: async (ctx, { jobId }) => { requireDevelopment(); const job = await ctx.db.get(jobId); if (!job || job.status !== 'failed') throw new Error('Only failed jobs can be retried.'); await ctx.db.patch(jobId, { status: 'queued', attempts: 0 }); await ctx.scheduler.runAfter(0, internal.render.run, { jobId }); } });
