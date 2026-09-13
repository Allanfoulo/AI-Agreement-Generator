import { DeleteDocumentSetUseCase } from "../application/commands/delete-document-set.ts";
import { SaveDocumentSetUseCase } from "../application/commands/save-document-set.ts";
import type { Clock, IdGenerator } from "../application/ports.ts";
import { InMemoryMessageBus, InMemoryOutbox } from "../infrastructure/events/in-memory-message-bus.ts";
import { LocalStorageDocumentSetRepository } from "../infrastructure/persistence/local-storage-document-set-repository.ts";

const clock: Clock = { now: () => new Date() };
const ids: IdGenerator = {
  next: (prefix) => `${prefix}_${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`,
};

export const localDocumentSets = (() => {
  const repository = new LocalStorageDocumentSetRepository();
  const outbox = new InMemoryOutbox();
  const messageBus = new InMemoryMessageBus();
  return {
    repository,
    outbox,
    messageBus,
    save: new SaveDocumentSetUseCase(repository, outbox, clock, ids),
    delete: new DeleteDocumentSetUseCase(repository, outbox, clock),
  };
})();
