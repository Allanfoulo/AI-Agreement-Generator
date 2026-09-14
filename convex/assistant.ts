"use node";
import { action } from './_generated/server';
import { v } from 'convex/values';
import { Agent } from '@mastra/core/agent';
import { z } from 'zod';
import { internal } from './_generated/api';

const suggestion = z.object({ kind: z.enum(['content_suggestion', 'clarification_required', 'not_allowed']), text: z.string().max(20000), assumptions: z.array(z.string()).max(20), missingFields: z.array(z.string()).max(20) });
export const draft = action({ args: { instruction: v.string(), documentType: v.string() }, handler: async (ctx, args) => {
  if (process.env.BIZDOC_ALLOW_UNAUTHENTICATED !== 'true') throw new Error('Shared development access is disabled.');
  if (args.instruction.length > 8000) throw new Error('Request is too long.');
  if (!process.env.GOOGLE_API_KEY) return { kind: 'not_allowed' as const, text: 'The server model key is not configured.', assumptions: [], missingFields: ['GOOGLE_API_KEY'] };
  const runId = await ctx.runMutation(internal.agentRuns.start, {});
  try {
    const agent = new Agent({ id: 'bizdoc-drafter', name: 'BizDoc document drafter', model: 'google/gemini-2.5-flash', instructions: 'Draft narrative content only. Never issue documents, change payments, bank details or salaries. Never produce HTML, identifiers, authoritative amounts or dates. Ask for clarification when facts are missing. Do not assert legal compliance. Return plain text for human review. You have no mutation tools.' });
    const response = await agent.generate(`Document type: ${args.documentType}\nRequest: ${args.instruction}`, { structuredOutput: { schema: suggestion }, maxSteps: 1, abortSignal: AbortSignal.timeout(45000) });
    const result = suggestion.parse(response.object);
    await ctx.runMutation(internal.agentRuns.finish, { id: runId, failed: false }); return result;
  } catch { await ctx.runMutation(internal.agentRuns.finish, { id: runId, failed: true }); throw new Error('Draft assistant failed. Please retry.'); }
}});
