import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

export function LegacyImport() {
  const migrate = useMutation(api.imports.legacy);
  const [payload, setPayload] = useState<Parameters<typeof migrate>[0] | null>(null);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function preview() {
    setBusy(true);
    try {
      const read = (key: string, fallback: unknown) => { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); };
      const data = { clients: read('bizdoc_clients', []), packages: read('bizdoc_item_packages', []), documents: read('bizdoc_saved_document_sets', []), profile: read('bizdoc_company_profile', undefined) , recipient: read('bizdoc_client_details', { name: '', company: '', address: '' }), logo: localStorage.getItem('bizdoc_company_logo') ?? undefined, invoiceCounter: Number(localStorage.getItem('bizdoc_invoice_counter') ?? 1), quoteCounter: Number(localStorage.getItem('bizdoc_quote_counter') ?? 1) };
      const bytes = new TextEncoder().encode(JSON.stringify(data)); const digest = await crypto.subtle.digest('SHA-256', bytes);
      const key = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
      const next = { ...data, key, dryRun: true }; const result = await migrate(next); setPayload(next); setMessage(`${result.count} records found. Existing matching records will be preserved.`);
    } catch { setMessage('Unable to read or validate the legacy data. Your browser data has not been changed.'); } finally { setBusy(false); }
  }
  async function commit() { if (!payload) return; setBusy(true); try { const result = await migrate({ ...payload, dryRun: false }); setMessage(`Import complete: ${result.count} records. Browser originals are preserved.`); setPayload(null); } catch { setMessage('Import failed. Original browser data is preserved.'); } finally { setBusy(false); } }
  return <section className="bg-white p-6 rounded-xl"><h1 className="text-2xl mb-4">Import existing browser data</h1><p>Open this app on the same browser and address used by the original app. Preview the import before copying records into the shared workspace.</p><button disabled={busy} onClick={preview} className="p-3 border rounded mt-4">Preview import</button>{payload && <button disabled={busy} onClick={commit} className="p-3 border rounded m-4">Import records</button>}<p role="status">{message}</p></section>;
}
