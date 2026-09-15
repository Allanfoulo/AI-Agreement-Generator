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
      title: 'Taxed invoice', issueDate: '2026-09-15', currency: 'ZAR',
      lines: [{ id: 'line-1', name: 'Consulting', quantityMilli: 1000, unitPriceMinor: 10000, discountBasisPoints: 1000, taxRateBasisPoints: 1500 }],
      sections: [{ heading: 'Terms', body: 'Payment due on receipt.' }],
    },
    company: { companyName: 'BizDoc', address: 'HQ', repName: 'A. Owner', repTitle: 'Director' },
    recipient: { name: 'Client', company: 'Client Co', address: 'Client address' },
  });
  assert.equal(model.lines[0].totalMinor, 10350);
  assert.equal(model.totalMinor, 10350);
  assert.deepEqual(model.sections, [{ heading: 'Terms', body: 'Payment due on receipt.' }]);
});

test('render mapper supports non-financial narrative documents without inventing totals', () => {
  const model = toDocumentRenderModel({
    type: 'sla', number: 'SLA-000001', revision: 2, totalMinor: 0,
    snapshot: { title: 'Support SLA', issueDate: '2026-09-15', currency: 'ZAR', lines: [], sections: [{ heading: 'Response', body: 'Within four hours.' }] },
    company: { companyName: 'BizDoc', address: 'HQ', repName: 'A. Owner', repTitle: 'Director' },
    recipient: { name: 'Client', company: 'Client Co', address: 'Client address' },
  });
  assert.deepEqual(model.lines, []);
  assert.equal(model.sections[0].body, 'Within four hours.');
});
