import { CreateQuoteDraftUseCase } from "../application/commands/create-quote-draft.ts";
import type { Clock, IdGenerator, PermissionChecker } from "../application/ports.ts";
import { InMemoryMessageBus, InMemoryOutbox } from "../infrastructure/events/in-memory-message-bus.ts";
import { InMemoryQuoteRepository } from "../infrastructure/persistence/in-memory-quote-repository.ts";

const clock: Clock = { now: () => new Date() };
const ids: IdGenerator = {
  next: (prefix) => `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`,
};
const permissions: PermissionChecker = {
  assertAllowed: () => undefined,
};

export function createBizDocKernel() {
  const quoteRepository = new InMemoryQuoteRepository();
  const messageBus = new InMemoryMessageBus();
  const outbox = new InMemoryOutbox();
  const unitOfWork = { execute: <T>(work: () => Promise<T>) => work() };
  return {
    quoteRepository,
    messageBus,
    outbox,
    createQuoteDraft: new CreateQuoteDraftUseCase(quoteRepository, outbox, permissions, clock, ids, unitOfWork),
  };
}
