import { PageNumber, TotalPages } from 'takumi-pdf/primitives';
import type { DocumentRenderModel } from '../contracts/render-model';

const templates = {
  modern: { ink: '#2f4538', muted: '#6d766c', accent: '#b85a34', wash: '#edf0e3', border: '1px solid #dce2d7', radius: 12, tableText: '#fdfcf8' },
  corporate: { ink: '#26342d', muted: '#66716a', accent: '#2f4538', wash: '#eff2ed', border: '1px solid #d5ddd5', radius: 4, tableText: '#fdfcf8' },
  minimal: { ink: '#303631', muted: '#7a827b', accent: '#62756a', wash: '#f7f7f2', border: '1px solid #e1e3dc', radius: 0, tableText: '#303631' },
} as const;

function money(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

function label(type: DocumentRenderModel['type']) {
  return ({ quote: 'Quotation', invoice: 'Invoice', sla: 'Service Level Agreement', employee_letter: 'Employee Letter' })[type];
}

export function StructuredDocument({ model }: { model: DocumentRenderModel }) {
  const family = (model.templateKey.split('/')[1]?.split('@')[0] ?? 'modern') as keyof typeof templates;
  const theme = templates[family] ?? templates.modern;
  const minimal = family === 'minimal';
  const showBank = model.payment.method === 'bank' || model.payment.method === 'bank_and_mobile_wallet';
  const showWallet = model.payment.method === 'mobile_wallet' || model.payment.method === 'bank_and_mobile_wallet';
  return (
    <main style={{ color: theme.ink, fontFamily: 'Arial, sans-serif', fontSize: 11, lineHeight: 1.45, padding: 0 }}>
      <header style={{ borderBottom: `${family === 'minimal' ? 1 : family === 'corporate' ? 4 : 3}px solid ${theme.accent}`, paddingBottom: family === 'minimal' ? 14 : 18, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ color: theme.accent, fontFamily: 'Georgia, serif', fontSize: 24, fontStyle: family === 'minimal' ? 'italic' : 'normal', fontWeight: family === 'corporate' ? 700 : 500 }}>{model.company.name || 'Brief Doc X'}</div>
            <div style={{ color: theme.muted, whiteSpace: 'pre-wrap' }}>{model.company.address}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: theme.accent, fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700 }}>{label(model.type)}</div>
            <div style={{ color: theme.muted }}>{model.number} · Version {model.revision}</div>
            <div style={{ color: theme.muted }}>Issued {model.issueDate || 'Date to be confirmed'}</div>
          </div>
        </div>
      </header>

      <section style={{ backgroundColor: minimal ? 'transparent' : theme.wash, border: minimal ? 'none' : theme.border, borderRadius: theme.radius, padding: 14, marginBottom: 20 }}>
        <div style={{ color: theme.muted, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Prepared for</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{model.recipient.name}</div>
        <div>{model.recipient.company}</div>
        <div style={{ color: theme.muted, whiteSpace: 'pre-wrap' }}>{model.recipient.address}</div>
      </section>

      <h1 style={{ fontSize: 18, marginBottom: 14 }}>{model.title}</h1>

      {model.lines.length > 0 && (
        <table style={{ borderCollapse: 'collapse', marginBottom: 20, width: '100%' }}>
          <thead style={{ backgroundColor: minimal ? 'transparent' : theme.accent, color: theme.tableText, borderBottom: minimal ? `2px solid ${theme.accent}` : undefined }}>
            <tr>
              <th style={{ padding: 9, textAlign: 'left' }}>Description</th>
              <th style={{ padding: 9, textAlign: 'right', width: 70 }}>Qty</th>
              <th style={{ padding: 9, textAlign: 'right', width: 100 }}>Unit</th>
              <th style={{ padding: 9, textAlign: 'right', width: 110 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {model.lines.map(line => (
              <tr key={line.id} style={{ breakInside: 'avoid', borderBottom: theme.border }}>
                <td style={{ padding: 9 }}><div style={{ fontWeight: 700 }}>{line.name}</div>{line.description && <div style={{ color: theme.muted, fontSize: 9 }}>{line.description}</div>}</td>
                <td style={{ padding: 9, textAlign: 'right' }}>{(line.quantityMilli / 1000).toFixed(3).replace(/\.000$/, '')}</td>
                <td style={{ padding: 9, textAlign: 'right' }}>{money(line.unitPriceMinor, model.currency)}</td>
                <td style={{ padding: 9, textAlign: 'right', fontWeight: 700 }}>{money(line.totalMinor, model.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 26 }}>
        <div style={{ borderTop: `${minimal ? 1 : 2}px solid ${theme.accent}`, minWidth: 220, paddingTop: 10, textAlign: 'right' }}><span style={{ color: theme.muted, marginRight: 24 }}>Total</span><strong>{money(model.totalMinor, model.currency)}</strong></div>
      </div>

      {(showBank || showWallet) && <section style={{ backgroundColor: minimal ? 'transparent' : theme.wash, border: minimal ? `1px solid ${theme.accent}` : theme.border, borderRadius: theme.radius, padding: 14, marginBottom: 22 }}>
        <div style={{ color: theme.accent, fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Payment details</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {showBank && <div style={{ minWidth: 190 }}><div style={{ fontWeight: 700, marginBottom: 4 }}>Bank transfer</div><div>{model.payment.bank.bankName}</div><div>Account name: {model.payment.bank.accountName}</div><div>Account number: {model.payment.bank.accountNumber}</div>{model.payment.bank.branchCode && <div>Branch code: {model.payment.bank.branchCode}</div>}{model.payment.bank.accountType && <div>Account type: {model.payment.bank.accountType}</div>}{model.payment.bank.swiftCode && <div>SWIFT: {model.payment.bank.swiftCode}</div>}</div>}
          {showWallet && <div style={{ minWidth: 190 }}><div style={{ fontWeight: 700, marginBottom: 4 }}>Mobile wallet</div><div>Provider: {model.payment.mobileWallet.provider}</div><div>Number: {model.payment.mobileWallet.number}</div><div>Account name: {model.payment.mobileWallet.name}</div><div style={{ color: theme.muted, fontSize: 9, marginTop: 6 }}>Confirm the recipient name in your wallet app before payment.</div></div>}
        </div>
      </section>}

      {model.sections.map(section => (
        <section key={section.heading} style={{ breakInside: 'avoid', marginBottom: 16 }}>
          <h2 style={{ borderBottom: theme.border, color: theme.accent, fontFamily: 'Georgia, serif', fontSize: 12, paddingBottom: 5 }}>{section.heading}</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{section.body}</p>
        </section>
      ))}

      <section style={{ borderTop: theme.border, color: theme.muted, marginTop: 30, paddingTop: 12 }}>
        <div>{model.company.representative}</div><div>{model.company.representativeTitle}</div>
      </section>
    </main>
  );
}

export function documentFooter() {
  return <div style={{ borderTop: '1px solid #dce2d7', color: '#6d766c', display: 'flex', justifyContent: 'space-between', paddingTop: 6, width: '100%' }}>Brief Doc X - Authoritative issued artifact <span>Page <PageNumber /> of <TotalPages /></span></div>;
}
