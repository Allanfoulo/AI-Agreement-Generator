import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { recordEvent } from './events';
export const start = internalMutation({ args: { documentType: v.string(), inputHash: v.string() }, handler: async (ctx, args) => ctx.db.insert('agentRuns', { status: 'running', documentType: args.documentType, inputHash: args.inputHash, createdAt: Date.now() }) });
export const finish = internalMutation({ args: { id: v.id('agentRuns'), failed: v.boolean(), outputKind: v.optional(v.string()) }, handler: async (ctx, { id, failed, outputKind }) => { await ctx.db.patch(id, { status: failed ? 'failed' : 'completed', outputKind, completedAt: Date.now() }); await recordEvent(ctx, failed ? 'AgentRunFailed' : 'AgentRunCompleted', id); } });
