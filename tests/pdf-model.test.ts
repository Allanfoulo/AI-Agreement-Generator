import test from 'node:test';
import assert from 'node:assert/strict';
import { toDocumentRenderModel } from '../src/pdf/mappers/document-render-model.ts';

test('render mapper preserves authoritative financial line totals', () => {
  const model = toDocumentRenderModel({
    type: 'invoice',
    number: 'INV-000001',
    revision: 2,
    totalMinor: 10350,
    snapshot: {
      title: 'Taxed invoice', issueDate: '2026-09-15', currency: 'ZAR', templateKey: 'invoice/corporate@1',
      lines: [{ id: 'line-1', name: 'Consulting', quantityMilli: 1000, unitPriceMinor: 10000, discountBasisPoints: 1000, taxRateBasisPoints: 1500 }],
      sections: [{ heading: 'Terms', body: 'Payment due on receipt.' }],
    },
    company: { companyName: 'BizDoc', address: 'HQ', repName: 'A. Owner', repTitle: 'Director' },
    recipient: { name: 'Client', company: 'Client Co', address: 'Client address' },
  });
  assert.equal(model.lines[0].totalMinor, 10350);
  assert.equal(model.totalMinor, 10350);
  assert.equal(model.templateKey, 'invoice/corporate@1');
  assert.deepEqual(model.sections, [{ heading: 'Terms', body: 'Payment due on receipt.' }]);
});

test('render mapper supports non-financial narrative documents without inventing totals', () => {
  const model = toDocumentRenderModel({
    type: 'sla', number: 'SLA-000001', revision: 2, totalMinor: 0,
    snapshot: { title: 'Support SLA', issueDate: '2026-09-15', currency: 'ZAR', templateKey: 'sla/general@1', lines: [], sections: [{ heading: 'Response', body: 'Within four hours.' }] },
    company: { companyName: 'BizDoc', address: 'HQ', repName: 'A. Owner', repTitle: 'Director' },
    recipient: { name: 'Client', company: 'Client Co', address: 'Client address' },
  });
  assert.deepEqual(model.lines, []);
  assert.equal(model.sections[0].body, 'Within four hours.');
});

test('render mapper snapshots the selected mobile wallet payment details', () => {
  const model = toDocumentRenderModel({
    type: 'quote', number: 'QT-000001', revision: 1, totalMinor: 25000,
    snapshot: { title: 'Wallet quote', issueDate: '2026-09-15', currency: 'LSL', templateKey: 'quote/modern@1', paymentMethod: 'mobile_wallet', lines: [{ id: 'line-1', name: 'Materials', quantityMilli: 1000, unitPriceMinor: 25000 }], sections: [] },
    company: { companyName: 'Brief Doc X', address: 'HQ', repName: 'A. Owner', repTitle: 'Director', bankName: '', accountName: '', accountNumber: '', branchCode: '', accountType: '', swiftCode: '', mobileWalletProvider: 'EcoCash', mobileWalletNumber: '+266 5000 0000', mobileWalletName: 'Brief Doc X' },
    recipient: { name: 'Client', company: 'Client Co', address: 'Client address' },
  });
  assert.equal(model.payment.method, 'mobile_wallet');
  assert.deepEqual(model.payment.mobileWallet, { provider: 'EcoCash', number: '+266 5000 0000', name: 'Brief Doc X' });
});

test('normalizes supported template families per document type', async () => {
  const { normalizeTemplateKey, templateFamilyFromKey } = await import('../src/pdf/templates/template-registry.ts');
  assert.equal(normalizeTemplateKey('invoice', 'invoice/minimal@1'), 'invoice/minimal@1');
  assert.equal(normalizeTemplateKey('invoice', 'quote/corporate@1'), 'invoice/modern@1');
  assert.equal(templateFamilyFromKey('invoice', 'invoice/corporate@1'), 'corporate');
});
