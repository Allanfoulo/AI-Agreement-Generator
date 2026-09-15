import { useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import type { Client } from '../App';

const field = 'border rounded p-2 w-full text-gray-900 bg-white';
function renderLabel(status?: string) {
  return ({ queued: 'Queued', processing: 'Rendering', completed: 'Ready', failed: 'Failed' } as Record<string, string>)[status ?? ''] ?? 'Waiting for issue';
}
export function BackendDocuments({ clients }: { clients: Client[] }) {
  const documents = useQuery(api.documents.list) ?? []; const catalog = useQuery(api.catalog.list); const jobs = useQuery(api.render.list) ?? []; const audit = useQuery(api.events.recent) ?? [];
  const draftWithAssistant = useAction(api.assistant.draft);
  const save = useMutation(api.documents.save); const issue = useMutation(api.documents.issue); const transition = useMutation(api.documents.transition); const convert = useMutation(api.documents.convert); const payment = useMutation(api.documents.payment); const retry = useMutation(api.render.retry);
  const addEmployee = useMutation(api.catalog.employee); const addService = useMutation(api.catalog.service);
  const [type, setType] = useState<'quote' | 'invoice' | 'sla' | 'employee_letter'>('quote'); const [title, setTitle] = useState(''); const [recipientId, setRecipient] = useState(''); const [currency, setCurrency] = useState('ZAR'); const [narrative, setNarrative] = useState('');
  const [lines, setLines] = useState<Array<{ id: string; name: string; quantityMilli: number; unitPriceMinor: number }>>([{ id: crypto.randomUUID(), name: '', quantityMilli: 1000, unitPriceMinor: 0 }]);
  const [editing, setEditing] = useState<Id<'documents'> | undefined>(); const [revision, setRevision] = useState(0); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [person, setPerson] = useState(''); const [position, setPosition] = useState(''); const [service, setService] = useState(''); const [price, setPrice] = useState('0');
  const [assistantInstruction, setAssistantInstruction] = useState(''); const [assistantDraftId, setAssistantDraftId] = useState<Id<'documents'>>();
  const [assistantDetails, setAssistantDetails] = useState('');
  async function run(work: () => Promise<unknown>) { setBusy(true); try { await work(); setMessage('Saved successfully.'); } catch (e) { setMessage(e instanceof Error ? e.message : 'Operation failed.'); } finally { setBusy(false); } }
  async function askAssistant() {
    if (!assistantInstruction.trim()) return;
    setBusy(true);
    try {
      const result = await draftWithAssistant({ instruction: assistantInstruction, documentType: type });
      const details = [
        result.assumptions.length ? `Assumptions: ${result.assumptions.join('; ')}` : '',
        result.missingFields.length ? `Missing: ${result.missingFields.join('; ')}` : '',
        result.sourceRecordIds.length ? `Sources: ${result.sourceRecordIds.join(', ')}` : '',
      ].filter(Boolean).join('\n');
      setAssistantDetails(details);
      if (result.kind === 'content_suggestion') {
        setNarrative(current => current ? `${current}\n\n${result.text}` : result.text);
        setMessage('Assistant suggestion added to the draft for review.');
      } else if (result.kind === 'draft_created') {
        setAssistantDraftId(result.documentId as Id<'documents'> | undefined);
        setMessage(`Draft created${result.documentId ? `: ${result.documentId}` : ''}. Open it for review before issuing.`);
      } else {
        setMessage(result.text);
      }
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Assistant unavailable.'); }
    finally { setBusy(false); }
  }
  function edit(doc: typeof documents[number]) { setEditing(doc._id); setRevision(doc.revision); setType(doc.type); setTitle(doc.content.title); setRecipient(doc.content.recipientId); setCurrency(doc.content.currency); setNarrative(doc.content.sections.map(s => s.body).join('\n\n')); setLines(doc.content.lines.map(l => ({ id: l.id, name: l.name, quantityMilli: l.quantityMilli, unitPriceMinor: l.unitPriceMinor }))); }
  return <div className="space-y-6">
    <p className="text-sm">Shared development workspace. Documents persist in the backend. Authentication is deferred.</p>
    <section className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 space-y-3"><h2 className="text-xl">Drafting assistant</h2><p className="text-sm">Ask for narrative wording or explicitly request a draft. The assistant cannot issue, pay, delete, or change authoritative document facts.</p><textarea className={field} rows={3} placeholder="e.g. Add a concise after-hours support clause" value={assistantInstruction} onChange={e => setAssistantInstruction(e.target.value)} /><button className="bg-indigo-600 text-white rounded p-3" disabled={busy || !assistantInstruction.trim()} onClick={() => void askAssistant()}>Ask assistant</button>{assistantDraftId && <button className="underline" onClick={() => { const draft = documents.find(document => document._id === assistantDraftId); if (draft) { edit(draft); setAssistantDraftId(undefined); } else setMessage('The new draft is still syncing. Try again in a moment.'); }}>Open draft</button>}{assistantDetails && <p className="whitespace-pre-wrap text-xs text-gray-600" role="note">{assistantDetails}</p>}</section>
    <section className="bg-white rounded-xl p-6 border space-y-3"><h1 className="text-2xl">{editing ? 'Edit draft' : 'Create a document'}</h1>
      <label className="block">Type<select className={field} value={type} onChange={e => { setType(e.target.value as typeof type); setRecipient(''); }}>{['quote', 'invoice', 'sla', 'employee_letter'].map(t => <option key={t}>{t}</option>)}</select></label>
      <label className="block">Title<input className={field} value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label className="block">Recipient<select className={field} value={recipientId} onChange={e => setRecipient(e.target.value)}><option value="">Select recipient</option>{type === 'employee_letter' ? catalog?.employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>) : clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select></label>
      <label className="block">Currency<select className={field} value={currency} onChange={e => setCurrency(e.target.value)}><option>ZAR</option><option>LSL</option></select></label>
      {(type === 'quote' || type === 'invoice') && <div className="space-y-2"><select aria-label="Add service" className={field} value="" onChange={e => { const s = catalog?.services.find(s => s._id === e.target.value); if (s) setLines(prev => [...prev.filter(l => l.name), { id: crypto.randomUUID(), name: s.name, quantityMilli: 1000, unitPriceMinor: s.unitPriceMinor }]); }}><option value="">Add a catalog service</option>{catalog?.services.filter(s => s.currency === currency).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select>{lines.map((l, i) => <div key={l.id} className="grid grid-cols-3 gap-2"><input aria-label="Line description" className={field} value={l.name} onChange={e => setLines(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} /><input aria-label="Quantity" className={field} type="number" min="0.001" step="0.001" value={l.quantityMilli / 1000} onChange={e => setLines(prev => prev.map((x, j) => j === i ? { ...x, quantityMilli: Math.round(Number(e.target.value) * 1000) } : x))} /><input aria-label="Unit price" className={field} type="number" min="0" step="0.01" value={l.unitPriceMinor / 100} onChange={e => setLines(prev => prev.map((x, j) => j === i ? { ...x, unitPriceMinor: Math.round(Number(e.target.value) * 100) } : x))} /></div>)}<button onClick={() => setLines(prev => [...prev, { id: crypto.randomUUID(), name: '', quantityMilli: 1000, unitPriceMinor: 0 }])}>Add line</button></div>}
      <label className="block">Terms / letter content<textarea className={field} rows={6} value={narrative} onChange={e => setNarrative(e.target.value)} /></label>
      <button className="bg-indigo-600 text-white rounded p-3" disabled={busy} onClick={() => run(async () => { await save({ id: editing, expectedRevision: revision, type, requestKey: crypto.randomUUID(), content: { title, recipientId, currency, lines: type === 'quote' || type === 'invoice' ? lines : [], sections: [{ heading: 'Terms', body: narrative }], depositBasisPoints: 4000, issueDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' }), templateKey: 'basic@1' } }); setEditing(undefined); setRevision(0); setTitle(''); })}>Save draft</button>
    </section>
    <p role="status">{message}</p>
    <section className="bg-white rounded-xl p-6 border"><h2 className="text-xl">Documents</h2>{documents.map(d => { const renderJob = d.number ? jobs.find(job => job.documentId === d._id && job.documentNumber === d.number) : undefined; return <article key={d._id} className="border-b py-4"><h3>{d.number ?? 'Draft'} · {d.content.title}</h3><p>{d.status} · {d.content.currency} {(d.totalMinor / 100).toFixed(2)}</p>{d.number && <p className="text-sm text-gray-600">PDF: {renderLabel(renderJob?.status)}{renderJob?.status === 'completed' && renderJob.url && <> · <a className="underline" href={renderJob.url} target="_blank" rel="noreferrer">Preview / download</a></>}{renderJob?.status === 'failed' && <button className="underline ml-2" disabled={busy} onClick={() => run(() => retry({ jobId: renderJob._id }))}>Retry render</button>}</p>}<div className="flex gap-4 flex-wrap">
      {d.status === 'draft' && <><button disabled={busy} onClick={() => edit(d)}>Edit</button><button disabled={busy} onClick={() => run(() => issue({ id: d._id, expectedRevision: d.revision }))}>Issue</button></>}
      {d.type === 'quote' && ['issued', 'sent', 'viewed'].includes(d.status) && <button disabled={busy} onClick={() => run(() => transition({ id: d._id, status: 'accepted', expectedRevision: d.revision }))}>Accept quote</button>}
      {d.type === 'quote' && d.status === 'accepted' && <>{[4000, 6000, 10000].map(b => <button key={b} disabled={busy} onClick={() => run(() => convert({ id: d._id, basisPoints: b, requestKey: crypto.randomUUID() }))}>Invoice {b / 100}%</button>)}</>}
      {d.type === 'invoice' && !['draft', 'void', 'paid'].includes(d.status) && <button disabled={busy} onClick={() => { const amount = window.prompt('Payment amount'); if (amount !== null) void run(() => payment({ id: d._id, amountMinor: Math.round(Number(amount) * 100), requestKey: crypto.randomUUID() })); }}>Record payment</button>}
      {d.type === 'sla' && d.status === 'awaiting_signature' && <button disabled={busy} onClick={() => run(() => transition({ id: d._id, status: 'active', expectedRevision: d.revision }))}>Record activation</button>}
    </div></article>; })}</section>
    <section className="bg-white rounded-xl p-6 border"><h2 className="text-xl">PDF jobs</h2>{jobs.map(j => <div key={j._id} className="py-2">{renderLabel(j.status)} · attempts {j.attempts} {j.documentNumber && <span>{j.documentNumber} v{j.versionNumber}</span>} {j.checksum && <span className="text-xs text-gray-500">· checksum {j.checksum.slice(0, 12)}…</span>} {j.url && <a className="underline" href={j.url} target="_blank" rel="noreferrer">Preview / download</a>}{j.status === 'failed' && <button onClick={() => run(() => retry({ jobId: j._id }))}>Retry</button>}</div>)}</section>
    <section className="bg-white rounded-xl p-6 border space-y-3"><h2 className="text-xl">Employees & services</h2><input className={field} placeholder="Employee name" aria-label="Employee name" value={person} onChange={e => setPerson(e.target.value)} /><input className={field} placeholder="Position" aria-label="Position" value={position} onChange={e => setPosition(e.target.value)} /><button disabled={busy} onClick={() => run(() => addEmployee({ name: person, position, email: '', currency }))}>Add employee</button><input className={field} placeholder="Service name" aria-label="Service name" value={service} onChange={e => setService(e.target.value)} /><input className={field} aria-label="Service price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} /><button disabled={busy} onClick={() => run(() => addService({ name: service, description: '', unitPriceMinor: Math.round(Number(price) * 100), currency }))}>Add service</button></section>
    <section className="bg-white rounded-xl p-6 border"><h2 className="text-xl">Activity</h2>{audit.slice(0, 15).map(a => <p key={a._id}>{a.action} · {new Date(a.occurredAt).toLocaleString()}</p>)}</section>
  </div>;
}
