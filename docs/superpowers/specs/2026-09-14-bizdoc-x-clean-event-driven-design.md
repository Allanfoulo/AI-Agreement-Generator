# BizDoc X Clean Architecture and Event-Driven Design

## Architecture Goal

Keep BizDoc X's business rules independent of Next.js, Convex, Mastra, Windmill, PDF tooling, and model providers while making important state changes observable, auditable, retryable, and extractable into future services.

The MVP remains a modular monolith. Event-driven behavior is introduced through explicit domain events, a durable outbox/event log, and tracked jobs; an external broker is deferred until operational scale or independent deployment justifies it.

## Domain Concepts

- Organization, membership, role, permission
- Client, employee, service, service package
- Document, document version, render artifact
- Quote, invoice, SLA agreement, employee letter
- Money, document number, lifecycle transition, snapshot
- Agent run, job, audit event, idempotency key

The domain owns invariants, lifecycle transitions, money rules, authorization policies, snapshot semantics, and the meaning of statuses. Persistence models and external payloads are not domain entities.

## Use Cases and Commands

Use cases accept plain request DTOs and return response DTOs. They depend on ports, not frameworks.

- Create/update/archive organization records
- Create and revise document drafts
- Issue, void, accept, reject, acknowledge, expire, or terminate documents where allowed
- Convert an accepted quote into an invoice idempotently
- Allocate document numbers
- Create immutable document snapshots
- Request and retry PDF rendering
- Record payments and derive invoice status
- Request/import legacy data
- Execute approved agent draft actions

Commands are imperative and synchronous when the caller needs an immediate result. Long-running work returns a job reference.

## Events

Domain events are immutable facts emitted after a successful application transaction. Critical events are persisted through an outbox/event-log port in the same transaction as the state change.

| Event | Published when | Consumers | Delivery | Durable |
|---|---|---|---|---|
| `DocumentDraftCreated` | A draft is created | Audit, search/read-model refresh | In-process/outbox | Yes |
| `DocumentVersionCreated` | A new version is saved | Audit, preview invalidation | In-process/outbox | Yes |
| `QuoteAccepted` | A valid quote enters accepted state | Conversion UI/read model, audit | Outbox | Yes |
| `InvoiceIssued` | An invoice is issued with a number and snapshot | Render request, audit | Outbox | Yes |
| `DocumentStatusChanged` | Any valid lifecycle transition occurs | Audit, read models | Outbox | Yes |
| `RenderRequested` | A version requires authoritative PDF output | Render worker | Outbox/job queue | Yes |
| `RenderCompleted` | PDF artifact is stored | Document read model, audit, UI notification | Outbox | Yes |
| `AgentDraftCreated` | Agent creates a draft or proposal | Audit, UI activity | Outbox | Yes |
| `LegacyImportRequested` | A validated import is submitted | Import worker, audit | Outbox/job queue | Yes |

Every event uses a versioned envelope with `eventId`, `eventType`, `version`, `aggregateId`, `aggregateType`, `occurredAt`, actor, correlation ID, causation ID, and typed data. Events are append-only; consumers tolerate duplicate delivery and additive fields.

## Jobs

| Job | Input | Success | Retry/failure |
|---|---|---|---|
| `RenderDocumentJob` | Document/version/template IDs | Stored PDF artifact and checksum | Exponential retry; then `failed`/`needs_review` |
| `ImportLegacyDataJob` | Validated export ID | Reconciled import summary | Retry safe stages; conflicts become `needs_review` |
| `SweepDocumentExpiryJob` | Organization/time window | Valid status transitions | Retry by organization; alert after repeated failure |
| `SweepInvoiceOverdueJob` | Organization/time window | Derived overdue transitions | Idempotent retry; record failure |
| `AgentRunJob` | Agent run ID and approved request | Typed draft/proposal result | Bounded retry; never retry a critical mutation blindly |

Job records expose `pending`, `queued`, `processing`, `completed`, `failed`, `cancelled`, and `needs_review`. Each job has an idempotency key, correlation ID, retry count, timestamps, and redacted error metadata.

## Coupling Analysis

- Operational: PDF rendering, model calls, and Windmill must not block core document commands. Use jobs, timeouts, retries, and visible pending/failed states.
- Developmental: UI, agent prompts, and database schemas must not share internal shapes. Use application DTOs, mappers, ports, and versioned contracts.
- Semantic: statuses such as issued, accepted, paid, and active must have one canonical definition in the domain glossary and transition policies.
- Functional: totals, permissions, numbering, and lifecycle validation must have one authoritative implementation in domain/application code.
- Incidental: no workflow may parse UI labels, raw HTML, free-text model output, or unversioned webhook payloads. Use typed schemas and boundary validation.

## Responsibility Split

- UI: rendering, form state, optimistic feedback, and calling application APIs.
- Application: commands, queries, permission checks, transaction orchestration, idempotency, event recording, and job creation.
- Domain: entities, value objects, policies, invariants, calculations, transitions, and domain events.
- Ports: repositories, clock, ID/number allocator, event publisher, message bus, job queue, storage, renderer, identity, and agent gateway contracts.
- Adapters: Convex functions, HTTP routes, message handlers, job processors, agent tools, DTO mappers, and presenters.
- Infrastructure: Convex persistence, file storage, PDF renderer, Mastra/model provider, Windmill, logging, and monitoring.

Agents may interpret intent and call approved tools. They cannot own business rules, bypass authorization, issue/void documents, mark invoices paid, mutate bank/salary records, or emit authoritative totals/dates/IDs.

## Message and Port Contracts

The core defines generic ports such as `Repository<T>`, `EventPublisher`, `MessageBus`, `JobQueue`, `DocumentRenderer`, and `AgentGateway`. Convex, Windmill, Mastra, and PDF implementations live outside the core.

External input is validated at the adapter boundary and again at the command boundary. Renderers receive a complete `DocumentRenderModel`; templates never query business data. Agent tools return typed result envelopes containing action, status, assumptions, source IDs, missing fields, and user-facing next steps.

## Folder Structure

Organize by business capability, with the dependency direction visible within each capability:

```text
src/
  domain/{documents,financial,hr,sla,organization,catalog}/
  application/{commands,queries,ports,dto,handlers}/
  adapters/{http,convex,agent,messaging,jobs,presenters}/
  infrastructure/{convex,mastra,pdf,storage,windmill,observability}/
  composition/
tests/{unit,application,contracts,integration,e2e,pdf-golden}/
```

Next.js components remain delivery code. Convex files are adapters/infrastructure and may call application handlers; inner layers must not import them.

## Testing Strategy

- Unit-test entities, value objects, calculations, policies, and transition matrices without Convex, HTTP, or framework setup.
- Test application commands with fake ports for authorization, idempotency, transaction boundaries, and emitted events.
- Contract-test event envelopes, command DTOs, job payloads, agent tools, and renderer input.
- Test duplicate/out-of-order event handling and retry behavior.
- Integration-test Convex adapters, outbox delivery, job lifecycle, storage association, and organization isolation.
- E2E-test quote-to-invoice, issuance, rendering failure/retry, agent clarification, and restricted HR/finance actions.
- Add an architectural dependency check that prevents domain/application imports from adapters or infrastructure.

## Migration Sequence

1. Preserve and tag the legacy prototype.
2. Establish domain modules and application ports before feature CRUD.
3. Implement deterministic money, numbering, authorization, and transitions.
4. Add Convex adapters and transactional outbox/event-log records.
5. Build quote-to-invoice as the first complete vertical slice.
6. Add render jobs and event consumers with retries/idempotency.
7. Add SLA and employee-letter capabilities.
8. Add Mastra as an outer adapter using approved application tools.
9. Add legacy import as a validated job.
10. Introduce an external broker only when measured operational needs justify it.

## Final Recommendation

Use a clean modular monolith with domain-owned rules, application-owned commands, inward-facing ports, outer adapters, durable event recording, and explicit jobs. This meets MVP needs without broker complexity, reduces coupling, protects sensitive operations, and leaves a credible path to service extraction.
