import { useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import type { Client } from '../App';

function renderLabel(status?: string) {
  return ({ queued: 'Queued', processing: 'Rendering', completed: 'Ready', failed: 'Failed' } as Record<string, string>)[status ?? ''] ?? 'Waiting for issue';
}

function statusClass(status: string) {
  if (status === 'draft') return 'draft';
  if (status === 'queued' || status === 'processing') return 'pending';
  return '';
}

const inputClass = 'brief-input';
const selectClass = 'brief-select';
const textAreaClass = 'brief-textarea';

export function BackendDocuments({ clients }: { clients: Client[] }) {
  const documents = useQuery(api.documents.list) ?? [];
  const catalog = useQuery(api.catalog.list);
  const jobs = useQuery(api.render.list) ?? [];
  const audit = useQuery(api.events.recent) ?? [];
  const draftWithAssistant = useAction(api.assistant.draft);
  const save = useMutation(api.documents.save);
  const issue = useMutation(api.documents.issue);
  const transition = useMutation(api.documents.transition);
  const convert = useMutation(api.documents.convert);
  const payment = useMutation(api.documents.payment);
  const retry = useMutation(api.render.retry);
  const addEmployee = useMutation(api.catalog.employee);
  const addService = useMutation(api.catalog.service);

  const [type, setType] = useState<'quote' | 'invoice' | 'sla' | 'employee_letter'>('quote');
  const [title, setTitle] = useState('');
  const [recipientId, setRecipient] = useState('');
  const [currency, setCurrency] = useState('ZAR');
  const [narrative, setNarrative] = useState('');
  const [lines, setLines] = useState<Array<{ id: string; name: string; quantityMilli: number; unitPriceMinor: number }>>([{ id: crypto.randomUUID(), name: '', quantityMilli: 1000, unitPriceMinor: 0 }]);
  const [editing, setEditing] = useState<Id<'documents'> | undefined>();
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [person, setPerson] = useState('');
  const [position, setPosition] = useState('');
  const [service, setService] = useState('');
  const [price, setPrice] = useState('0');
  const [assistantInstruction, setAssistantInstruction] = useState('');
  const [assistantDraftId, setAssistantDraftId] = useState<Id<'documents'>>();
  const [assistantDetails, setAssistantDetails] = useState('');

  async function run(work: () => Promise<unknown>) {
    setBusy(true);
    try { await work(); setMessage('Saved successfully.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Operation failed.'); }
    finally { setBusy(false); }
  }

  function edit(doc: typeof documents[number]) {
    setEditing(doc._id);
    setRevision(doc.revision);
    setType(doc.type);
    setTitle(doc.content.title);
    setRecipient(doc.content.recipientId);
    setCurrency(doc.content.currency);
    setNarrative(doc.content.sections.map(section => section.body).join('\n\n'));
    setLines(doc.content.lines.map(line => ({ id: line.id, name: line.name, quantityMilli: line.quantityMilli, unitPriceMinor: line.unitPriceMinor })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
        setMessage('Suggestion added to the draft for review.');
      } else if (result.kind === 'draft_created') {
        setAssistantDraftId(result.documentId as Id<'documents'> | undefined);
        setMessage('Draft created. Open it for review before issuing.');
      } else setMessage(result.text);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Assistant unavailable.'); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <section className="workspace-hero">
        <div>
          <p className="hero-kicker">Brief Doc X workspace</p>
          <h1>Business documents, without the back-and-forth.</h1>
        </div>
        <p className="hero-copy">Create from the information you already have. Keep every amount, recipient, and clause visible before it becomes official.</p>
      </section>

      <div className="document-grid">
        <div>
          <section className="paper-panel assistant-panel">
            <div className="panel-heading">
              <div><h2>Ask Brief Doc</h2><p>Draft language or request a new document.</p></div>
              <div className="assistant-mark" aria-hidden="true">✦</div>
            </div>
            <div className="assistant-body">
              <textarea className={textAreaClass} rows={3} placeholder="Try: Create a quote for Acme for 3 hours of consulting at R2,500 per hour" value={assistantInstruction} onChange={event => setAssistantInstruction(event.target.value)} />
              <div className="assistant-actions">
                <button className="button-primary" disabled={busy || !assistantInstruction.trim()} onClick={() => void askAssistant()}>Ask assistant</button>
                {assistantDraftId && <button className="button-link" onClick={() => { const draft = documents.find(document => document._id === assistantDraftId); if (draft) { edit(draft); setAssistantDraftId(undefined); } else setMessage('The new draft is still syncing. Try again in a moment.'); }}>Open draft</button>}
                <span className="assistant-hint">Facts stay deterministic. AI only proposes.</span>
              </div>
              {assistantDetails && <p className="whitespace-pre-wrap text-xs text-[color:var(--ink-muted)] mt-4" role="note">{assistantDetails}</p>}
            </div>
          </section>

          <section className="paper-panel form-panel" id="document-builder">
            <div className="panel-heading"><div><h2>{editing ? 'Edit draft' : 'Create a document'}</h2><p>Structured fields first, polished output second.</p></div><span className="section-kicker">{editing ? 'Draft revision' : 'New brief'}</span></div>
            <div className="form-body">
              <label className="brief-label">Document type<select className={selectClass} value={type} onChange={event => { setType(event.target.value as typeof type); setRecipient(''); }}><option value="quote">Quote</option><option value="invoice">Invoice</option><option value="sla">Service level agreement</option><option value="employee_letter">Employee letter</option></select></label>
              <label className="brief-label">Title<input className={inputClass} value={title} placeholder="e.g. Website support proposal" onChange={event => setTitle(event.target.value)} /></label>
              <label className="brief-label">Recipient<select className={selectClass} value={recipientId} onChange={event => setRecipient(event.target.value)}><option value="">Select recipient</option>{type === 'employee_letter' ? catalog?.employees.map(employee => <option key={employee._id} value={employee._id}>{employee.name}</option>) : clients.map(client => <option key={client.id} value={client.id}>{client.company}</option>)}</select></label>
              <label className="brief-label">Currency<select className={selectClass} value={currency} onChange={event => setCurrency(event.target.value)}><option>ZAR</option><option>LSL</option></select></label>
              {(type === 'quote' || type === 'invoice') && <div className="line-editor"><div className="line-editor-head"><span>Line items</span><button className="button-link" onClick={() => setLines(previous => [...previous, { id: crypto.randomUUID(), name: '', quantityMilli: 1000, unitPriceMinor: 0 }])}>+ Add line</button></div>{lines.map((line, index) => <div key={line.id} className="line-row"><input aria-label="Line description" className={inputClass} placeholder="Service or item" value={line.name} onChange={event => setLines(previous => previous.map((current, lineIndex) => lineIndex === index ? { ...current, name: event.target.value } : current))} /><input aria-label="Quantity" className={inputClass} type="number" min="0.001" step="0.001" value={line.quantityMilli / 1000} onChange={event => setLines(previous => previous.map((current, lineIndex) => lineIndex === index ? { ...current, quantityMilli: Math.round(Number(event.target.value) * 1000) } : current))} /><input aria-label="Unit price" className={inputClass} type="number" min="0" step="0.01" value={line.unitPriceMinor / 100} onChange={event => setLines(previous => previous.map((current, lineIndex) => lineIndex === index ? { ...current, unitPriceMinor: Math.round(Number(event.target.value) * 100) } : current))} /></div>)}</div>}
              <label className="brief-label">Terms and content<textarea className={textAreaClass} rows={6} placeholder="Add the context your recipient needs to see" value={narrative} onChange={event => setNarrative(event.target.value)} /></label>
              <div className="flex items-center gap-3"><button className="button-primary" disabled={busy} onClick={() => run(async () => { await save({ id: editing, expectedRevision: revision, type, requestKey: crypto.randomUUID(), content: { title, recipientId, currency, lines: type === 'quote' || type === 'invoice' ? lines : [], sections: [{ heading: 'Terms', body: narrative }], depositBasisPoints: 4000, issueDate: new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' }), templateKey: `${type}/modern@1` } }); setEditing(undefined); setRevision(0); setTitle(''); })}>{editing ? 'Save changes' : 'Save draft'}</button>{editing && <button className="button-quiet" onClick={() => setEditing(undefined)}>Cancel edit</button>}</div>
            </div>
          </section>
        </div>

        <section className="paper-panel documents-panel">
          <div className="panel-heading"><div><h2>Recent documents</h2><p>{documents.length ? `${documents.length} documents in this workspace` : 'Your issued work will appear here.'}</p></div><span className="section-kicker">Live</span></div>
          {documents.length === 0 ? <p className="empty-copy">Start with a quote, invoice, SLA, or employee letter. Your saved drafts will stay here as you work.</p> : <div className="document-list">{documents.map(document => {
            const renderJob = document.number ? jobs.find(job => job.documentId === document._id && job.documentNumber === document.number) : undefined;
            return <article key={document._id} className="document-row"><div><h3 className="document-title">{document.content.title || 'Untitled document'}</h3><div className="document-meta"><span>{document.number ?? 'Draft'}</span><span className={`status-dot ${statusClass(document.status)}`}>{document.status}</span><span>{document.type.replace('_', ' ')}</span></div>{document.number && <p className="pdf-state">PDF: {renderLabel(renderJob?.status)}{renderJob?.status === 'completed' && renderJob.url && <> · <a href={renderJob.url} target="_blank" rel="noreferrer">Preview / download</a></>}{renderJob?.status === 'failed' && <button className="button-link ml-2" disabled={busy} onClick={() => run(() => retry({ jobId: renderJob._id }))}>Retry render</button>}</p>}</div><div><div className="document-amount">{document.content.currency} {(document.totalMinor / 100).toFixed(2)}</div><div className="document-actions mt-3">{document.status === 'draft' && <><button className="button-link" disabled={busy} onClick={() => edit(document)}>Edit</button><button className="button-quiet" disabled={busy} onClick={() => run(() => issue({ id: document._id, expectedRevision: document.revision }))}>Issue</button></>}{document.type === 'quote' && ['issued', 'sent', 'viewed'].includes(document.status) && <button className="button-link" disabled={busy} onClick={() => run(() => transition({ id: document._id, status: 'accepted', expectedRevision: document.revision }))}>Accept</button>}{document.type === 'quote' && document.status === 'accepted' && <>{[4000, 6000, 10000].map(basisPoints => <button key={basisPoints} className="button-link" disabled={busy} onClick={() => run(() => convert({ id: document._id, basisPoints, requestKey: crypto.randomUUID() }))}>Invoice {basisPoints / 100}%</button>)}</>}{document.type === 'invoice' && !['draft', 'void', 'paid'].includes(document.status) && <button className="button-link" disabled={busy} onClick={() => { const amount = window.prompt('Payment amount'); if (amount !== null) void run(() => payment({ id: document._id, amountMinor: Math.round(Number(amount) * 100), requestKey: crypto.randomUUID() })); }}>Record payment</button>}{document.type === 'sla' && document.status === 'awaiting_signature' && <button className="button-link" disabled={busy} onClick={() => run(() => transition({ id: document._id, status: 'active', expectedRevision: document.revision }))}>Activate</button>}</div></div></article>;
          })}</div>}
        </section>
      </div>

      <section className="paper-panel jobs-panel"><div className="panel-heading"><div><h2>PDF activity</h2><p>Issued artifacts are generated from their immutable versions.</p></div><span className="section-kicker">Worker queue</span></div><div className="jobs-list">{jobs.slice(0, 12).map(job => <div key={job._id} className="job-row"><strong>{renderLabel(job.status)}</strong> · {job.documentNumber ?? 'Unnumbered'} v{job.versionNumber ?? '-'} · attempts {job.attempts}{job.url && <> · <a href={job.url} target="_blank" rel="noreferrer">Open PDF</a></>}{job.status === 'failed' && <button className="button-link ml-2" onClick={() => run(() => retry({ jobId: job._id }))}>Retry</button>}</div>)}</div></section>

      <section className="paper-panel mt-5"><div className="panel-heading"><div><h2>Workspace records</h2><p>Add reusable people and services for faster documents.</p></div><span className="section-kicker">Reference data</span></div><div className="form-body"><div className="grid md:grid-cols-3 gap-3"><input className={inputClass} placeholder="Employee name" aria-label="Employee name" value={person} onChange={event => setPerson(event.target.value)} /><input className={inputClass} placeholder="Position" aria-label="Position" value={position} onChange={event => setPosition(event.target.value)} /><button className="button-quiet" disabled={busy} onClick={() => run(() => addEmployee({ name: person, position, email: '', currency }))}>Add employee</button></div><div className="grid md:grid-cols-3 gap-3"><input className={inputClass} placeholder="Service name" aria-label="Service name" value={service} onChange={event => setService(event.target.value)} /><input className={inputClass} aria-label="Service price" type="number" step="0.01" value={price} onChange={event => setPrice(event.target.value)} /><button className="button-quiet" disabled={busy} onClick={() => run(() => addService({ name: service, description: '', unitPriceMinor: Math.round(Number(price) * 100), currency }))}>Add service</button></div></div></section>

      <section className="paper-panel mt-5"><div className="panel-heading"><div><h2>Activity</h2><p>Recent changes across the shared workspace.</p></div></div><div className="jobs-list">{audit.slice(0, 12).map(event => <div key={event._id} className="job-row">{event.action} · {new Date(event.occurredAt).toLocaleString()}</div>)}</div></section>
      <p role="status" className="mt-4 text-xs text-[color:var(--ink-muted)]">{message}</p>
    </div>
  );
}
