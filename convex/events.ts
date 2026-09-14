import { internalMutation, query, type MutationCtx } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

// Authentication is deliberately deferred. Every public function fails closed
// unless the operator explicitly enables the shared development workspace.
export function requireDevelopment() {
  if (process.env.BIZDOC_ALLOW_UNAUTHENTICATED !== 'true') throw new Error('Shared development access is disabled.');
}
export async function recordEvent(ctx: MutationCtx, eventType: string, aggregateId: string, correlationId = aggregateId) {
  const eventId = await ctx.db.insert('events', { eventType, version: 1, aggregateId, occurredAt: Date.now(), correlationId, delivered: false });
  await ctx.scheduler.runAfter(0, internal.events.deliver, { eventId });
}
export const deliver = internalMutation({ args: { eventId: v.id('events') }, handler: async (ctx, { eventId }) => {
  const event = await ctx.db.get(eventId);
  if (!event || event.delivered) return;
  const audit = await ctx.db.query('audit').withIndex('by_event', q => q.eq('eventId', eventId)).unique();
  if (!audit) await ctx.db.insert('audit', { eventId, action: event.eventType, entityId: event.aggregateId, occurredAt: event.occurredAt });
  await ctx.db.patch(eventId, { delivered: true });
}});
export const recent = query({ args: {}, handler: async ctx => { requireDevelopment(); return ctx.db.query('audit').order('desc').take(100); } });
