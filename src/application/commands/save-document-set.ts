import { createDomainEvent } from "../../domain/events/domain-event.ts";
import type {
  Clock,
  DocumentSetRepository,
  EventPublisher,
  IdGenerator,
  RequestContext,
  SavedDocumentSetRecord,
} from "../ports.ts";

export type SaveDocumentSetInput = Omit<SavedDocumentSetRecord, "id" | "savedAt"> & {
  readonly id?: string;
  readonly savedAt?: string;
};

export class SaveDocumentSetUseCase {
  private readonly repository: DocumentSetRepository;
  private readonly events: EventPublisher;
  private readonly clock: Clock;
  private readonly ids: IdGenerator;

  public constructor(
    repository: DocumentSetRepository,
    events: EventPublisher,
    clock: Clock,
    ids: IdGenerator,
  ) {
    this.repository = repository;
    this.events = events;
    this.clock = clock;
    this.ids = ids;
  }

  public async execute(
    context: RequestContext,
    input: SaveDocumentSetInput,
  ): Promise<SavedDocumentSetRecord> {
    if (!input.documents.length) throw new Error("At least one document is required");
    if (!input.clientCompany.trim()) throw new Error("Client company is required");
    if (input.documents.some((document) => !document.type.trim() || !document.html.trim())) {
      throw new Error("Document type and content are required");
    }

    const documentSet: SavedDocumentSetRecord = {
      id: input.id ?? this.ids.next("document-set"),
      savedAt: input.savedAt ?? this.clock.now().toISOString(),
      clientCompany: input.clientCompany.trim(),
      documents: input.documents.map((document) => ({ ...document })),
    };
    this.repository.save(documentSet);
    await this.events.publish(createDomainEvent({
      eventType: "DocumentSetSaved",
      version: 1,
      aggregateId: documentSet.id,
      aggregateType: "document_set",
      actor: { type: context.actorType ?? "user", id: context.userId },
      data: {
        documentSetId: documentSet.id,
        organizationId: context.organizationId,
        documentCount: documentSet.documents.length,
      },
      metadata: { correlationId: context.correlationId },
    }));
    return documentSet;
  }
}
