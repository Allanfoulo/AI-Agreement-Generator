import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { recordEvent } from './events';
export const start = internalMutation({ args: {}, handler: async ctx => ctx.db.insert('agentRuns', { status: 'running', createdAt: Date.now() }) });
export const finish = internalMutation({ args: { id: v.id('agentRuns'), failed: v.boolean() }, handler: async (ctx, { id, failed }) => { await ctx.db.patch(id, { status: failed ? 'failed' : 'completed', completedAt: Date.now() }); await recordEvent(ctx, failed ? 'AgentRunFailed' : 'AgentRunCompleted', id); } });
