import type { DomainEvent } from "../domain/events/domain-event";
import type { FinancialLineInput, CalculationResult } from "../domain/financial/money";

export type RequestContext = {
  readonly userId: string;
  readonly organizationId: string;
  readonly actorType?: "user" | "agent" | "system";
  readonly correlationId: string;
};

export type Permission = "documents:create" | "documents:issue" | "finance:read" | "hr:read";

export interface PermissionChecker {
  assertAllowed(context: RequestContext, permission: Permission): void;
}

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(prefix: string): string;
}

export interface EventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}

export interface UnitOfWork {
  /** Infrastructure supplies the transaction; the application supplies the work. */
  execute<T>(work: () => Promise<T>): Promise<T>;
}

export interface EventHandler<T> {
  (event: DomainEvent<T>): Promise<void> | void;
}

export interface MessageBus extends EventPublisher {
  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void;
}

export interface JobQueue {
  enqueue<T>(job: { jobId: string; jobType: string; input: T; idempotencyKey: string; correlationId: string }): Promise<{ jobId: string }>;
}

export interface Outbox extends EventPublisher {
  pending(): readonly DomainEvent<unknown>[];
}

export type QuoteDraft = {
  readonly id: string;
  readonly organizationId: string;
  readonly clientId: string;
  readonly title: string;
  readonly currency: string;
  readonly status: "draft";
  readonly calculation: CalculationResult;
  readonly createdAt: string;
};

export interface QuoteRepository {
  save(quote: QuoteDraft): Promise<void>;
  getById(id: string, organizationId: string): Promise<QuoteDraft | undefined>;
}

export type SavedDocument = {
  readonly type: string;
  readonly html: string;
};

export type SavedDocumentSetRecord = {
  readonly id: string;
  readonly savedAt: string;
  readonly clientCompany: string;
  readonly documents: readonly SavedDocument[];
};

export interface DocumentSetRepository {
  list(): SavedDocumentSetRecord[];
  save(documentSet: SavedDocumentSetRecord): void;
  delete(id: string): void;
}

export type CreateQuoteDraftInput = {
  readonly clientId: string;
  readonly title: string;
  readonly currency: string;
  readonly lines: readonly FinancialLineInput[];
  readonly depositBasisPoints?: number;
  readonly idempotencyKey: string;
};
