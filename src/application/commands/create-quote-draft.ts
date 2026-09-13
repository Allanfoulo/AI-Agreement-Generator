import { createDomainEvent } from "../../domain/events/domain-event.ts";
import { calculateFinancialDocument } from "../../domain/financial/money.ts";
import type {
  Clock,
  CreateQuoteDraftInput,
  IdGenerator,
  PermissionChecker,
  QuoteDraft,
  QuoteRepository,
  RequestContext,
  EventPublisher,
  UnitOfWork,
} from "../ports.ts";

export class CreateQuoteDraftUseCase {
  private readonly quotes: QuoteRepository;
  private readonly events: EventPublisher;
  private readonly permissions: PermissionChecker;
  private readonly clock: Clock;
  private readonly ids: IdGenerator;
  private readonly unitOfWork: UnitOfWork;

  public constructor(
    quotes: QuoteRepository,
    events: EventPublisher,
    permissions: PermissionChecker,
    clock: Clock,
    ids: IdGenerator,
    unitOfWork: UnitOfWork,
  ) {
    this.quotes = quotes;
    this.events = events;
    this.permissions = permissions;
    this.clock = clock;
    this.ids = ids;
    this.unitOfWork = unitOfWork;
  }

  public async execute(context: RequestContext, input: CreateQuoteDraftInput): Promise<QuoteDraft> {
    this.permissions.assertAllowed(context, "documents:create");
    if (!input.clientId.trim()) throw new Error("Client is required");
    if (!input.title.trim()) throw new Error("Quote title is required");
    if (!input.idempotencyKey.trim()) throw new Error("Idempotency key is required");

    const calculation = calculateFinancialDocument({
      currency: input.currency,
      lines: input.lines,
      depositBasisPoints: input.depositBasisPoints,
    });
    const quote: QuoteDraft = {
      id: this.ids.next("quote"),
      organizationId: context.organizationId,
      clientId: input.clientId,
      title: input.title,
      currency: input.currency,
      status: "draft",
      calculation,
      createdAt: this.clock.now().toISOString(),
    };

    await this.unitOfWork.execute(async () => {
      await this.quotes.save(quote);
      await this.events.publish(createDomainEvent({
        eventType: "DocumentDraftCreated",
        version: 1,
        aggregateId: quote.id,
        aggregateType: "quote",
        actor: { type: context.actorType ?? "user", id: context.userId },
        data: {
          quoteId: quote.id,
          documentType: "quote",
          organizationId: quote.organizationId,
          clientId: quote.clientId,
          totalMinor: quote.calculation.totalMinor,
          currency: quote.currency,
        },
        metadata: { correlationId: context.correlationId },
      }));
    });

    return quote;
  }
}
