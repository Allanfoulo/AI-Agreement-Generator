import { PageNumber, TotalPages } from 'takumi-pdf/primitives';
import type { DocumentRenderModel } from '../contracts/render-model';

const border = '1px solid #e5e7eb';
const borderBottom = border;
const borderTop = border;
const ink = '#172033';
const muted = '#64748b';
const accent = '#4f46e5';

function money(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

function label(type: DocumentRenderModel['type']) {
  return ({ quote: 'Quotation', invoice: 'Invoice', sla: 'Service Level Agreement', employee_letter: 'Employee Letter' })[type];
}

export function StructuredDocument({ model }: { model: DocumentRenderModel }) {
  return (
    <main style={{ color: ink, fontFamily: 'Arial, sans-serif', fontSize: 11, lineHeight: 1.45, padding: 0 }}>
      <header style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 18, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ color: accent, fontSize: 24, fontWeight: 700 }}>{model.company.name || 'Brief Doc X'}</div>
            <div style={{ color: muted, whiteSpace: 'pre-wrap' }}>{model.company.address}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: accent, fontSize: 20, fontWeight: 700 }}>{label(model.type)}</div>
            <div style={{ color: muted }}>{model.number} · Version {model.revision}</div>
            <div style={{ color: muted }}>Issued {model.issueDate || 'Date to be confirmed'}</div>
          </div>
        </div>
      </header>

      <section style={{ backgroundColor: '#f8fafc', border, borderRadius: 6, padding: 14, marginBottom: 20 }}>
        <div style={{ color: muted, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Prepared for</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{model.recipient.name}</div>
        <div>{model.recipient.company}</div>
        <div style={{ color: muted, whiteSpace: 'pre-wrap' }}>{model.recipient.address}</div>
      </section>

      <h1 style={{ fontSize: 18, marginBottom: 14 }}>{model.title}</h1>

      {model.lines.length > 0 && (
        <table style={{ borderCollapse: 'collapse', marginBottom: 20, width: '100%' }}>
          <thead style={{ backgroundColor: accent, color: '#ffffff' }}>
            <tr>
              <th style={{ padding: 9, textAlign: 'left' }}>Description</th>
              <th style={{ padding: 9, textAlign: 'right', width: 70 }}>Qty</th>
              <th style={{ padding: 9, textAlign: 'right', width: 100 }}>Unit</th>
              <th style={{ padding: 9, textAlign: 'right', width: 110 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {model.lines.map(line => (
              <tr key={line.id} style={{ breakInside: 'avoid', borderBottom }}>
                <td style={{ padding: 9 }}><div style={{ fontWeight: 700 }}>{line.name}</div>{line.description && <div style={{ color: muted, fontSize: 9 }}>{line.description}</div>}</td>
                <td style={{ padding: 9, textAlign: 'right' }}>{(line.quantityMilli / 1000).toFixed(3).replace(/\.000$/, '')}</td>
                <td style={{ padding: 9, textAlign: 'right' }}>{money(line.unitPriceMinor, model.currency)}</td>
                <td style={{ padding: 9, textAlign: 'right', fontWeight: 700 }}>{money(line.totalMinor, model.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 26 }}>
        <div style={{ borderTop: `2px solid ${accent}`, minWidth: 220, paddingTop: 10, textAlign: 'right' }}><span style={{ color: muted, marginRight: 24 }}>Total</span><strong>{money(model.totalMinor, model.currency)}</strong></div>
      </div>

      {model.sections.map(section => (
        <section key={section.heading} style={{ breakInside: 'avoid', marginBottom: 16 }}>
          <h2 style={{ borderBottom, color: accent, fontSize: 12, paddingBottom: 5 }}>{section.heading}</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{section.body}</p>
        </section>
      ))}

      <section style={{ borderTop, color: muted, marginTop: 30, paddingTop: 12 }}>
        <div>{model.company.representative}</div><div>{model.company.representativeTitle}</div>
      </section>
    </main>
  );
}

export function documentFooter() {
  return <div style={{ borderTop, color: muted, display: 'flex', justifyContent: 'space-between', paddingTop: 6, width: '100%' }}>Brief Doc X - Authoritative issued artifact <span>Page <PageNumber /> of <TotalPages /></span></div>;
}
