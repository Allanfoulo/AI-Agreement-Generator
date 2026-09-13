export type EventActor = {
  readonly type: "user" | "agent" | "system";
  readonly id?: string;
};

export type DomainEvent<T> = {
  readonly eventId: string;
  readonly eventType: string;
  readonly version: number;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly occurredAt: string;
  readonly actor?: EventActor;
  readonly data: T;
  readonly metadata: {
    readonly correlationId: string;
    readonly causationId?: string;
  };
};

type CreateDomainEventInput<T> = Omit<DomainEvent<T>, "eventId" | "occurredAt"> & {
  readonly eventId?: string;
  readonly occurredAt?: string;
};

function newId(prefix: string): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  return randomUuid ? `${prefix}_${randomUuid}` : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function createDomainEvent<T>(input: CreateDomainEventInput<T>): DomainEvent<T> {
  return Object.freeze({
    ...input,
    eventId: input.eventId ?? newId("evt"),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
}
