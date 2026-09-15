"use node";

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { PDFDocument } from 'pdf-lib';
import { toDocumentRenderModel } from '../src/pdf/mappers/document-render-model';
import { renderDocumentPdf } from '../src/pdf/render-document';

export const run = internalAction({ args: { jobId: v.id('jobs') }, handler: async (ctx, { jobId }) => {
  const version = await ctx.runMutation(internal.render.claim, { jobId });
  if (!version) return;
  try {
    const model = toDocumentRenderModel({ ...version.version, type: version.type });
    const bytes = await renderDocumentPdf(model);
    const verification = await PDFDocument.load(bytes);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    const checksum = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const storageId = await ctx.storage.store(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
    await ctx.runMutation(internal.render.finish, { jobId, storageId, checksum, pageCount: verification.getPageCount(), failed: false });
  } catch {
    await ctx.runMutation(internal.render.finish, { jobId, failed: true });
  }
}});
