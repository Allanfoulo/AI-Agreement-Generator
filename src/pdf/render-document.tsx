import { initSync, render as renderPdf } from 'takumi-pdf/no-init';
import type { DocumentRenderModel } from './contracts/render-model';
import { documentFooter, StructuredDocument } from './templates/structured-document';

let takumiReady = false;

async function ensureTakumiReady() {
  if (takumiReady) return;
  const wasmUrl = process.env.TAKUMI_WASM_URL ?? 'https://unpkg.com/takumi-pdf@0.14.3/pkg/takumi_pdf_wasm_bg.wasm';
  const response = await fetch(wasmUrl);
  if (!response.ok) throw new Error(`Takumi WASM download failed: HTTP ${response.status}`);
  initSync({ module: await response.arrayBuffer() });
  takumiReady = true;
}

export async function renderDocumentPdf(model: DocumentRenderModel) {
  await ensureTakumiReady();
  return renderPdf(<StructuredDocument model={model} />, {
    size: 'a4',
    margin: { top: 48, right: 48, bottom: 54, left: 48 },
    footer: documentFooter(),
  });
}
