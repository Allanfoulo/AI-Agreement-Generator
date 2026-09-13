import type { DomainEvent } from "../../domain/events/domain-event.ts";
import type { EventHandler, MessageBus, Outbox } from "../../application/ports.ts";

export class InMemoryMessageBus implements MessageBus {
  private readonly handlers = new Map<string, Set<EventHandler<unknown>>>();
  private readonly publishedEvents: DomainEvent<unknown>[] = [];

  public async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.publishedEvents.push(event as DomainEvent<unknown>);
    const subscribers = this.handlers.get(event.eventType) ?? [];
    for (const handler of subscribers) {
      await handler(event);
    }
  }

  public subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    const subscribers = this.handlers.get(eventType) ?? new Set<EventHandler<unknown>>();
    subscribers.add(handler as EventHandler<unknown>);
    this.handlers.set(eventType, subscribers);
    return () => subscribers.delete(handler as EventHandler<unknown>);
  }

  public published(): readonly DomainEvent<unknown>[] {
    return this.publishedEvents;
  }
}

export class InMemoryOutbox implements Outbox {
  private readonly events: DomainEvent<unknown>[] = [];

  public async publish<T>(event: DomainEvent<T>): Promise<void> {
    this.events.push(event as DomainEvent<unknown>);
  }

  public pending(): readonly DomainEvent<unknown>[] {
    return this.events;
  }

  public async flush(bus: MessageBus): Promise<void> {
    while (this.events.length > 0) {
      const event = this.events.shift();
      if (event) await bus.publish(event);
    }
  }
}
