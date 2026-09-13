import { createDomainEvent } from "../../domain/events/domain-event.ts";
import type {
  Clock,
  DocumentSetRepository,
  EventPublisher,
  RequestContext,
} from "../ports.ts";

export class DeleteDocumentSetUseCase {
  private readonly repository: DocumentSetRepository;
  private readonly events: EventPublisher;
  private readonly clock: Clock;

  public constructor(
    repository: DocumentSetRepository,
    events: EventPublisher,
    clock: Clock,
  ) {
    this.repository = repository;
    this.events = events;
    this.clock = clock;
  }

  public async execute(context: RequestContext, id: string): Promise<void> {
    if (!id.trim()) throw new Error("Document set ID is required");
    this.repository.delete(id);
    await this.events.publish(createDomainEvent({
      eventType: "DocumentSetDeleted",
      version: 1,
      aggregateId: id,
      aggregateType: "document_set",
      actor: { type: context.actorType ?? "user", id: context.userId },
      data: { documentSetId: id, organizationId: context.organizationId, deletedAt: this.clock.now().toISOString() },
      metadata: { correlationId: context.correlationId },
    }));
  }
}
