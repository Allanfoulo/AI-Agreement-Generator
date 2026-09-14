import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { client, itemPackage, profile, recipient, legacySet, documentType, content } from './validators';

export default defineSchema({
  agentRuns: defineTable({ status: v.union(v.literal('running'), v.literal('completed'), v.literal('failed')), documentType: v.string(), inputHash: v.string(), outputKind: v.optional(v.string()), createdAt: v.number(), completedAt: v.optional(v.number()) }),
  workspace: defineTable({ key: v.string(), profile, recipient, logo: v.union(v.string(), v.null()), revision: v.number() }).index('by_key', ['key']),
  clients: defineTable({ data: client }).index('by_external', ['data.id']),
  packages: defineTable({ data: itemPackage }).index('by_external', ['data.id']),
  legacyDocuments: defineTable({ data: legacySet, revision: v.number(), archived: v.boolean() }).index('by_external', ['data.id']),
  employees: defineTable({ name: v.string(), position: v.string(), email: v.string(), salaryMinor: v.optional(v.number()), currency: v.string(), archived: v.boolean() }),
  services: defineTable({ name: v.string(), description: v.string(), unitPriceMinor: v.number(), currency: v.string(), archived: v.boolean() }),
  documents: defineTable({ type: documentType, content, status: v.string(), revision: v.number(), number: v.optional(v.string()), totalMinor: v.number(), amountPaidMinor: v.number(), sourceId: v.optional(v.id('documents')), archived: v.boolean(), createdAt: v.number() }).index('by_status', ['status']).index('by_source', ['sourceId']),
  versions: defineTable({ documentId: v.id('documents'), revision: v.number(), snapshot: content, company: profile, recipient, number: v.string(), totalMinor: v.number(), createdAt: v.number() }).index('by_document', ['documentId', 'revision']),
  sequences: defineTable({ type: documentType, next: v.number() }).index('by_type', ['type']),
  requests: defineTable({ key: v.string(), fingerprint: v.string(), result: v.string() }).index('by_key', ['key']),
  events: defineTable({ eventType: v.string(), version: v.number(), aggregateId: v.string(), occurredAt: v.number(), correlationId: v.string(), delivered: v.boolean() }).index('by_delivery', ['delivered']),
  audit: defineTable({ eventId: v.id('events'), action: v.string(), entityId: v.string(), occurredAt: v.number() }).index('by_event', ['eventId']),
  jobs: defineTable({ versionId: v.id('versions'), status: v.union(v.literal('queued'), v.literal('processing'), v.literal('completed'), v.literal('failed')), attempts: v.number(), storageId: v.optional(v.id('_storage')), checksum: v.optional(v.string()), pageCount: v.optional(v.number()), error: v.optional(v.string()), createdAt: v.number() }).index('by_version', ['versionId']),
  imports: defineTable({ key: v.string(), completedAt: v.number(), count: v.number() }).index('by_key', ['key']),
});
