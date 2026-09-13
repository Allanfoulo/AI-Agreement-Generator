import test from "node:test";
import assert from "node:assert/strict";
import { calculateFinancialDocument } from "../src/domain/financial/money.ts";
import { assertTransition, canTransition } from "../src/domain/documents/lifecycle.ts";
import { createBizDocKernel } from "../src/composition/bizdoc-kernel.ts";
import { LocalStorageDocumentSetRepository } from "../src/infrastructure/persistence/local-storage-document-set-repository.ts";

test("calculates financial totals using integer minor units", () => {
  const result = calculateFinancialDocument({
    currency: "ZAR",
    depositBasisPoints: 4000,
    lines: [{
      id: "website",
      name: "Website",
      quantityMilli: 1500,
      unitPriceMinor: 10_000,
      discountBasisPoints: 0,
      taxRateBasisPoints: 1500,
    }],
  });

  assert.equal(result.subtotalMinor, 15_000);
  assert.equal(result.taxMinor, 2_250);
  assert.equal(result.totalMinor, 17_250);
  assert.equal(result.depositMinor, 6_900);
  assert.equal(result.balanceMinor, 10_350);
});

test("rejects invalid quantities and mixed implicit currency input", () => {
  assert.throws(() => calculateFinancialDocument({
    currency: "ZAR",
    lines: [{ id: "bad", name: "Bad", quantityMilli: 0, unitPriceMinor: 100 }],
  }), /Quantity must be positive/);
  assert.throws(() => calculateFinancialDocument({
    currency: "",
    lines: [{ id: "bad", name: "Bad", quantityMilli: 1000, unitPriceMinor: 100 }],
  }), /Currency is required/);
});

test("enforces document lifecycle transitions", () => {
  assert.equal(canTransition("quote", "draft", "issued"), true);
  assert.equal(canTransition("quote", "draft", "accepted"), false);
  assert.throws(() => assertTransition("invoice", "draft", "paid"), /Invalid invoice transition/);
});

test("quote use case persists a draft and emits a typed event to the outbox", async () => {
  const kernel = createBizDocKernel();
  const quote = await kernel.createQuoteDraft.execute(
    {
      userId: "user_1",
      organizationId: "org_1",
      correlationId: "corr_1",
    },
    {
      clientId: "client_1",
      title: "Website build",
      currency: "ZAR",
      idempotencyKey: "quote-request-1",
      lines: [{ id: "line_1", name: "Website", quantityMilli: 1000, unitPriceMinor: 80_000 }],
    },
  );

  assert.equal(quote.status, "draft");
  assert.equal((await kernel.quoteRepository.getById(quote.id, "org_1"))?.id, quote.id);
  assert.equal(kernel.outbox.pending().length, 1);
  assert.equal(kernel.outbox.pending()[0]?.eventType, "DocumentDraftCreated");
  assert.equal((await kernel.quoteRepository.getById(quote.id, "org_2")), undefined);
});

test("outbox flushes events to the message bus", async () => {
  const kernel = createBizDocKernel();
  const seen: string[] = [];
  kernel.messageBus.subscribe("DocumentDraftCreated", (event) => {
    seen.push(event.eventId);
  });
  await kernel.outbox.publish({
    eventId: "evt_1",
    eventType: "DocumentDraftCreated",
    version: 1,
    aggregateId: "quote_1",
    aggregateType: "quote",
    occurredAt: new Date().toISOString(),
    data: { quoteId: "quote_1" },
    metadata: { correlationId: "corr_1" },
  });
  await kernel.outbox.flush(kernel.messageBus);
  assert.deepEqual(seen, ["evt_1"]);
  assert.equal(kernel.outbox.pending().length, 0);
});

test("local document-set adapter validates and persists records", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } as unknown as Storage;
  const repository = new LocalStorageDocumentSetRepository(storage);

  repository.save({
    id: "set_1",
    savedAt: "2026-09-14T00:00:00.000Z",
    clientCompany: "Example Client",
    documents: [{ type: "QUOTE", html: "<p>safe test content</p>" }],
  });
  assert.equal(repository.list()[0]?.clientCompany, "Example Client");

  values.set("bizdoc_saved_document_sets", JSON.stringify([{ id: "bad", documents: "not-an-array" }]));
  assert.deepEqual(repository.list(), []);
});
