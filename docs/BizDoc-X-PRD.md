# Brief Doc X

## Product Requirements Document and Implementation Blueprint

**Version:** 1.0
**Status:** Build-ready
**Prepared for:** Innovation Imperial
**Primary market:** SMEs and service businesses operating in Southern Africa
**Initial currencies:** ZAR and LSL
**Source application:** `Allanfoulo/AI-Agreement-Generator` at commit `615096c80e8d8623dcac6a79f3e22668d7434cfd`
**PDF component reference:** `shadcn-labs/pdfcn` at commit `5a0a8af1eba517ce6cd9615666054b21329f9891`

---

## 1. Executive Summary

Brief Doc X is an AI-assisted business-document workspace for service businesses. It turns reusable company, client, employee, and service data into professional quotes, invoices, employee letters, and service-level agreements.

The product is not an AI text box that emits arbitrary HTML. It is a structured document system:

1. Users and deterministic application logic create validated document data.
2. Mastra interprets natural-language requests and drafts language where judgment is useful.
3. Convex stores business records, document state, versions, and audit events.
4. `pdfcn`/Takumi renders controlled React templates into PDFs.
5. The same structured record powers the editor, preview, PDF, and later delivery workflows.

The core product promise is:

> Create, manage, and reuse professional business documents without repeatedly entering the same business information.

The first release must support:

- Quotes
- Invoices
- Quote-to-invoice conversion
- Employee letters
- Service-level agreements (SLAs)
- Company profiles
- Clients
- Employees
- Services and reusable service packages
- Live PDF preview and PDF download
- Document status, history, versioning, and audit events
- A Mastra Document Agent for natural-language document operations

BizDoc X deliberately stops short of becoming accounting, payroll, HRIS, or full CRM software.

---

## 2. Problem

Small service businesses repeatedly recreate the same facts across quotes, invoices, letters, and agreements. Their information is fragmented across old documents, messaging apps, spreadsheets, and memory. Generic AI can draft language, but it commonly invents facts, miscalculates totals, changes formatting, and produces output that cannot be tracked as an operational record.

The existing AI Agreement Generator proves demand and contains useful early concepts, but its implementation is prototype-grade:

- Gemini generates raw document HTML.
- Regex extracts `START_DOC`/`END_DOC` sections.
- The browser injects the output with `innerHTML`.
- Users directly edit generated HTML through `contenteditable`.
- `html2pdf` and `html2canvas` produce the file.
- Clients, company data, counters, packages, and saved documents live in `localStorage`.
- The model is instructed to calculate financial totals.
- Documents have no durable relationships, domain validation, organization boundary, reliable version history, or server-authoritative numbering.

This causes layout inconsistency, security risk, brittle parsing, unreliable calculations, weak multi-device support, and poor auditability.

---

## 3. Product Positioning

### 3.1 Product category

Business document operations for SMEs and service companies.

### 3.2 Ideal initial users

- Web and software agencies
- Consultants and freelancers
- Maintenance and installation companies
- Marketing and creative studios
- Small professional-services firms
- NGOs and small organizations that issue routine letters and agreements

### 3.3 Jobs to be done

- “Create a branded quote from my normal services and prices.”
- “Turn the accepted quote into an invoice without entering it again.”
- “Generate an SLA using the services, response times, and fees already agreed.”
- “Create a formal employee letter from an existing employee record.”
- “Find every document associated with this client.”
- “Change the design without changing the document’s facts.”
- “Use plain language to operate the system, but let me verify everything before issue.”

### 3.4 Product boundary

BizDoc X includes document-related operational facts and status. It does not include:

- General ledger or double-entry accounting
- Bank reconciliation
- Tax filing
- Payroll calculations or salary disbursement
- Inventory management
- Full sales CRM pipelines
- Full HR information-system functionality
- Legal advice or automatic legal approval
- Automatic emailing, payment collection, or electronic signatures in MVP

---

## 4. Product Principles

1. **Structured data is authoritative.** Generated prose and rendered PDFs are derived outputs.
2. **AI proposes; deterministic code decides.** Money, tax, dates, numbering, permissions, and state transitions are never delegated to an LLM.
3. **Every issued document is reproducible.** Its version stores immutable snapshots of the relevant company, recipient, financial, content, and template data.
4. **Templates own layout.** AI never generates HTML, CSS, JSX, or PDF layout.
5. **Drafts are editable; issued versions are immutable.** Corrections after issue create a new revision or an explicit void/replacement flow.
6. **Organization isolation is mandatory.** Every business record belongs to one organization and every server operation validates membership.
7. **Natural language is an interface, not the database.** The command bar invokes typed tools and returns a reviewable draft.
8. **Southern African defaults, global-ready domain.** ZAR/LSL, A4, local address formats, and VAT fields are first-class, without hard-coding one country.
9. **No silent assumptions on material facts.** Missing client, payment, employment, or SLA facts are surfaced for review.

---

## 5. Roles and Permissions

| Role | Main permissions |
|---|---|
| Owner | Full organization access, members, settings, numbering, templates, archive |
| Admin | All operational records and settings except ownership transfer/deletion |
| Finance | Clients, services, quotes, invoices, payments/status; no confidential employee compensation by default |
| HR | Employees and employee letters; no banking settings or financial documents by default |
| Member | Create and edit permitted drafts; view permitted records |
| Viewer | Read/download permitted documents only |

MVP can ship with Owner, Admin, and Member in the interface, while the schema and authorization layer support scoped permissions for Finance, HR, and Viewer.

Every query and mutation must authorize against `organizationMembers`; client-provided `organizationId` alone is never trusted.

---

## 6. Core Information Architecture

Primary navigation:

- Home
- Documents
- Quotes
- Invoices
- SLAs
- Employee Letters
- Clients
- Employees
- Services
- Templates
- Settings

Global actions:

- Command bar: “What would you like to create?”
- Quick create: Quote, Invoice, SLA, Employee Letter
- Organization switcher
- Search

### 6.1 Dashboard

The dashboard shows:

- Quote value awaiting a decision
- Invoice value outstanding and overdue
- Count of active SLAs
- Count of employee letters issued in the selected period
- Recent documents
- Recent activity
- Drafts requiring attention

Financial totals must be grouped by currency. Never add ZAR and LSL amounts into one number even if they are often equivalent in practice.

### 6.2 Client workspace

A client page shows contact details, notes, and related quotes, invoices, SLAs, total invoiced, total recorded as paid, and outstanding balances by currency.

### 6.3 Employee workspace

An employee page shows employment metadata and issued letters. Salary fields require explicit permission and must be omitted from general search results and logs.

---

## 7. Core User Flows

### 7.1 First-run onboarding

1. Create organization.
2. Complete company profile.
3. Upload logo and choose brand colors.
4. Configure default currency, locale, timezone, tax behavior, payment terms, quote validity, and document prefixes.
5. Add at least one service or skip.
6. Create the first document.

Completion should be progressive. Users can save an incomplete company profile, but issuance is blocked when fields required by the selected document are missing.

### 7.2 Create a quote manually

1. Select or create a client.
2. Add catalog services, a package, or custom line items.
3. Edit quantity, unit, price, discount, and tax category.
4. Define scope, deliverables, exclusions, timeline, payment schedule, validity, warranty/support, and notes.
5. Select a template.
6. Review live PDF preview.
7. Save draft or issue quote.

The server calculates subtotal, line discounts, document discount, tax, total, deposit, and remaining balance in integer minor units.

### 7.3 Quote to invoice

1. Mark quote as accepted.
2. Select “Convert to invoice.”
3. Choose invoice mode:
   - Full invoice
   - Deposit invoice
   - Custom progress invoice
4. The server snapshots the quote and creates a linked invoice draft.
5. The user reviews due date, line items, payment terms, and banking profile.
6. Issue the invoice.

Conversion must be idempotent: repeating the same request cannot accidentally create duplicate invoices. Multiple intended progress invoices are allowed and must reference the source quote.

### 7.4 Create a standalone invoice

Select a client, add items, review computed totals, choose terms, preview, and issue. The flow does not require a quote.

### 7.5 Create an SLA

1. Select the client and optionally an accepted quote/services.
2. Choose an SLA archetype, initially `technology-services` or `general-services`.
3. Supply service scope, availability, response targets, resolution targets, exclusions, responsibilities, reporting, fees, term, renewal, termination, confidentiality, data/security, IP, liability, governing law, and signatories.
4. Mastra may draft or rewrite narrative clauses from these structured facts.
5. The user reviews required facts and an “AI drafted—review before issue” marker.
6. Generate preview and issue.

The app must state that generated agreements are templates and not legal advice.

### 7.6 Create an employee letter

1. Select an employee.
2. Select a letter type.
3. Complete type-specific fields.
4. Optionally ask the agent to draft the body/tone.
5. Review, preview, and issue.

Initial types:

- Offer letter
- Employment confirmation
- Promotion letter
- Salary adjustment letter
- Warning letter
- Recommendation/reference letter
- Leave confirmation
- Termination letter
- Custom employee letter

Warning and termination letters require a confirmation notice before issuance because employment-law review may be necessary.

### 7.7 Natural-language command flow

Example:

> Create a deposit invoice for Megasol from their latest accepted website quote.

Flow:

1. The Document Agent searches for the client.
2. If one unambiguous match exists, it finds the latest accepted quote.
3. It invokes the deterministic quote-to-invoice command with `mode: deposit`.
4. The application creates a draft, not an issued document.
5. The UI opens the draft and explains the source records used.
6. The user reviews and explicitly issues it.

The agent must ask a targeted question when identity, source document, currency, or material terms are ambiguous.

---

## 8. Functional Requirements

### 8.1 Organization and company profile

- Multi-organization membership
- Legal and trading names
- Registration and tax/VAT identifiers
- Logo and brand colors
- Physical and postal addresses
- Country, locale, timezone, and default currency
- Email, phone, website
- Authorized representatives and signatories
- One or more banking profiles
- Default payment, quote, SLA, and footer terms
- Configurable document prefixes and number padding

### 8.2 Clients

- Company or individual client type
- Contact people
- Billing and physical addresses
- Registration/tax fields
- Default currency, payment terms, and tax treatment
- Notes, active/archive state
- Related-document timeline
- Search by company, contact, email, and document number

### 8.3 Employees

- Employee number
- Name and contact details
- Position, department, manager
- Start date and optional end date
- Employment type and status
- Optional salary amount/currency/pay period under scoped access
- Related employee letters
- Archive rather than destructive deletion when referenced

### 8.4 Services and packages

- Service name, description, SKU/code
- Unit type and base price in minor units
- Currency and default tax category
- Billing type: fixed, hourly, daily, monthly, per-unit, custom
- Default scope, deliverables, exclusions, timeline, deposit, warranty/support, and SLA profile
- Package containing versioned service items
- Adding a catalog item to a document copies a snapshot; later catalog edits cannot silently alter existing documents

### 8.5 Documents

- Unified document index and type-specific detail records
- Server-authoritative numbering
- Draft, preview, issue, download, archive, duplicate, revise
- Template switching without content regeneration
- Version history with immutable issued snapshots
- Source links such as quote-to-invoice
- A4 portrait default; Letter and landscape supported where templates allow
- Organization timezone used for dates
- PDF asset stored against the exact version that generated it
- Re-render creates a new render artifact, not an undocumented mutation of an issued version

### 8.6 Document status transitions

| Type | Allowed lifecycle |
|---|---|
| Quote | draft → issued → sent/viewed → accepted, rejected, expired, or converted; any non-draft may be voided where appropriate |
| Invoice | draft → issued → sent/viewed → partially_paid → paid; issued invoices may become overdue or void |
| SLA | draft → awaiting_signature → active → expired or terminated |
| Employee letter | draft → issued → acknowledged → archived |

“Sent” and “viewed” remain manual/event-ready statuses until delivery and public links are implemented. Status mutations must be validated server-side.

### 8.7 PDF templates

Initial design families:

- Modern
- Corporate
- Minimal

MVP can reuse and adapt `pdfcn` invoice blocks, then implement quote, SLA, and employee-letter blocks from shared primitives.

Reusable primitives:

- Company header
- Document metadata
- Recipient block
- Address block
- Items table
- Totals block
- Payment schedule
- Banking block
- Terms section
- Clause section
- Signature block
- Page header/footer
- Page number
- Confidentiality marker

Changing a template affects only presentation. It must not change content, totals, clauses, status, or numbering.

### 8.8 Audit and versioning

Create an audit event for:

- Record creation and archive
- Material profile/settings change
- Draft creation
- Document conversion
- Status transition
- Version creation
- PDF render
- AI draft/rewrite accepted
- Download

Do not log full confidential letter bodies, bank account values, access tokens, prompts containing sensitive HR data, or salary values. Store identifiers, action metadata, and redacted summaries.

---

## 9. Non-Functional Requirements

### 9.1 Security

- Enforce authorization in Convex functions, not only React routes.
- Keep model-provider keys and PDF rendering credentials server-side.
- Do not use `dangerouslySetInnerHTML` for model output.
- Validate all agent tool inputs with Zod and again at the domain command boundary.
- Sanitize uploaded filenames and validate MIME type/size.
- Use signed, time-limited asset access where applicable.
- Redact bank and HR fields from logs and telemetry.
- Rate-limit AI and render operations per organization.
- Prevent sequential document-number collisions with a server-side allocator.
- Make cross-organization identifier access indistinguishable from “not found.”

### 9.2 Reliability

- Financial calculations are deterministic and unit-tested.
- Document creation/conversion commands are idempotent.
- Critical state changes and their domain events are recorded atomically through the event log/outbox.
- Event publication is retryable and observable; a failed consumer cannot roll back an already committed business transaction.
- PDF render jobs expose queued, rendering, succeeded, and failed states.
- Failed rendering does not corrupt the document version.
- Draft autosave is debounced and shows sync state.
- Issuance either commits the version and number atomically or fails without partial state.

### 9.3 Performance targets

- Normal dashboard interactive within 2.5 seconds on a mid-range connection after authentication.
- Draft field updates reflected in preview within 500 ms excluding full PDF regeneration.
- Typical 1–5 page PDF render completes within 10 seconds at p95 under expected MVP load.
- Search returns the first page within 1 second at p95 for an organization with 10,000 documents.

### 9.4 Accessibility and responsiveness

- WCAG 2.1 AA color contrast and keyboard navigation for core flows.
- Desktop-first split editor/preview.
- Tablet stacks editor and preview.
- Mobile supports record management and simplified preview; complex template editing is not required.

### 9.5 Observability

- Structured logs with request, organization, document, render-job, and agent-run IDs.
- Sentry for application exceptions.
- OpenTelemetry-compatible traces around Convex commands, model calls, and render jobs where supported.
- Metrics for generation latency, rendering latency, failures, AI tool errors, issuance, and conversion completion.
- Never include private document content in telemetry payloads.

---

## 10. Target Architecture

### 10.1 Stack

| Layer | Choice |
|---|---|
| Web application | Next.js App Router, React, TypeScript |
| UI | Tailwind CSS and shadcn/ui |
| Persistence/realtime adapter | Convex |
| Application/use-case runtime | Framework-independent TypeScript application services and command handlers |
| Authentication | Convex-compatible auth provider behind an app auth adapter |
| AI orchestration | Mastra Document Agent and typed tools |
| Model | Provider-configurable; Gemini can remain the initial provider |
| PDF component system | `pdfcn` components with Takumi as the first rendering base |
| Validation | Zod at UI/server/agent boundaries; Convex validators for persistence functions |
| Background automation | Windmill for scheduled/external workflows, not core synchronous mutations |
| Deployment | Docker and Dokploy on existing infrastructure |
| Monitoring | Sentry plus existing Grafana/Prometheus/Loki/OpenTelemetry path where practical |

### 10.2 Responsibility boundaries

#### Next.js

- Authenticated application shell
- Forms and structured document editor
- Command bar and agent interaction UI
- Live preview display
- Server endpoint that invokes Mastra and renderer when appropriate
- Download endpoints and streaming responses

#### Application and domain core

- Domain entities, value objects, policies, calculations, and lifecycle transitions
- Application commands, queries, authorization, transaction orchestration, idempotency, and response DTOs
- Ports for repositories, identity, storage, rendering, message publication, and job queues
- Domain event creation and outbox/event-log recording through ports

The core must not import Next.js, Convex, Mastra, Windmill, PDF libraries, model SDKs, or storage APIs.

#### Convex adapter/infrastructure

- Persistence and realtime projections
- Organization-scoped repository implementations
- Boundary adapters that invoke application commands and queries
- Transactional state changes, outbox/event-log records, audit records, render-job records, and agent-run records

Convex is the persistence and realtime implementation, not the owner of the business architecture. Convex functions must delegate to application handlers and must not duplicate domain rules.

#### Mastra

- Intent classification
- Entity search/resolution through tools
- Drafting and rewriting narrative sections
- Orchestration of safe draft-only commands
- Structured output and clarification questions

Mastra cannot directly issue, void, delete, mark paid, or expose documents. Those actions remain explicit UI/domain commands with permission checks.

#### PDF engine

- Accept a validated `DocumentRenderModel`
- Render a selected controlled template
- Return PDF bytes plus metadata/checksum
- Never query business records directly from template components

#### Windmill

Deferred or scheduled operations such as overdue-status sweeps, expiry sweeps, reminder queues, bulk imports, and future delivery. Core create/update/issue flows must not depend on Windmill availability.

### 10.3 Data flow

1. User edits a typed form.
2. Client validation provides immediate feedback.
3. Convex mutation authorizes and saves normalized data.
4. Domain calculator derives totals.
5. A render-model builder creates a versioned snapshot.
6. `pdfcn`/Takumi renders the snapshot.
7. Convex records the render artifact and checksum.
8. UI presents preview/download for that exact version.

### 10.4 Dependency rule and boundary policy

Dependencies point inward:

```text
Frameworks & Drivers
  → Adapters
    → Application / Use Cases
      → Domain
```

- Domain code imports only domain code and standard-library primitives.
- Application code imports domain code and ports; it does not import delivery, persistence, agent, automation, or renderer implementations.
- Adapters translate HTTP, Convex, Mastra, Windmill, and message payloads into application DTOs.
- Infrastructure implements ports and is assembled at the composition root.
- Database records, ORM/BaaS types, React props, and provider payloads must not cross into domain entities or use-case signatures.
- Every boundary uses explicit DTOs, mappers, validation, and error contracts.

### 10.5 Architecture quality gate

The implementation must demonstrate all seven diagnostic properties before MVP release:

1. Domain rules are testable without a database, web server, or framework.
2. Source dependencies point inward.
3. The database can be replaced without changing domain rules.
4. Use cases are independent of HTTP, React, Convex, queues, and agents.
5. Frameworks and drivers are confined to adapters/infrastructure.
6. The component graph has no cycles.
7. The composition root wires concrete dependencies.

The target is 7/7 satisfied (10/10 architecture score). Any failed property requires an explicit inversion, boundary, or documented exception before release.

---

## 11. Canonical Domain Models

### 11.1 Money

All monetary values use integer minor units.

```ts
type Money = {
  currency: "ZAR" | "LSL" | string;
  amountMinor: number; // R8,000.00 = 800000
};
```

Rules:

- Do not store floats for money.
- One financial document has one currency in MVP.
- Tax and percentage rates use basis points: 15% = 1500.
- Rounding uses an explicitly tested half-up policy per calculated line/document.
- Formatting is presentation-only and locale-aware.

### 11.2 Document header

```ts
type DocumentHeader = {
  organizationId: Id<"organizations">;
  type: "quote" | "invoice" | "sla" | "employee_letter";
  number?: string; // allocated on issue, not trusted from client
  status: string;
  clientId?: Id<"clients">;
  employeeId?: Id<"employees">;
  templateKey: string;
  locale: string;
  currency?: string;
  issueDate?: string; // YYYY-MM-DD in organization timezone
  currentVersion: number;
};
```

### 11.3 Financial line item

```ts
type FinancialLineItem = {
  serviceId?: Id<"services">;
  sku?: string;
  name: string;
  description?: string;
  quantityMilli: number; // 1.5 hours = 1500
  unitLabel: string;
  unitPriceMinor: number;
  discountBasisPoints: number;
  taxRateBasisPoints: number;
  position: number;
};
```

Derived values are computed by the domain calculator and stored in issued snapshots, not accepted as authoritative user input.

### 11.4 Version snapshot

Every version stores a normalized render snapshot:

```ts
type DocumentVersionSnapshot = {
  schemaVersion: 1;
  document: Record<string, unknown>;
  organization: Record<string, unknown>;
  recipient: Record<string, unknown>;
  financials?: Record<string, unknown>;
  sections: Array<Record<string, unknown>>;
  template: {
    key: string;
    version: string;
    theme: Record<string, unknown>;
  };
};
```

Snapshots intentionally duplicate facts. If the company later changes its address or bank account, an already issued invoice still renders exactly as issued.

---

## 12. Convex Schema

The following is the target MVP schema. The coding agent may split validators into domain modules, but must preserve these concepts, indexes, organization ownership, and snapshot rules.

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const address = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.optional(v.string()),
  region: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  countryCode: v.string(),
});

const contact = v.object({
  name: v.string(),
  title: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  isPrimary: v.boolean(),
});

const documentType = v.union(
  v.literal("quote"),
  v.literal("invoice"),
  v.literal("sla"),
  v.literal("employee_letter"),
);

const lineItem = v.object({
  id: v.string(),
  serviceId: v.optional(v.id("services")),
  sku: v.optional(v.string()),
  name: v.string(),
  description: v.optional(v.string()),
  quantityMilli: v.number(),
  unitLabel: v.string(),
  unitPriceMinor: v.number(),
  discountBasisPoints: v.number(),
  taxRateBasisPoints: v.number(),
  position: v.number(),
});

export default defineSchema({
  users: defineTable({
    authSubject: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    lastActiveOrganizationId: v.optional(v.id("organizations")),
  })
    .index("by_auth_subject", ["authSubject"])
    .index("by_email", ["email"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerUserId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"), v.literal("admin"), v.literal("finance"),
      v.literal("hr"), v.literal("member"), v.literal("viewer"),
    ),
    status: v.union(v.literal("invited"), v.literal("active"), v.literal("disabled")),
    permissions: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_org_user", ["organizationId", "userId"]),

  companyProfiles: defineTable({
    organizationId: v.id("organizations"),
    legalName: v.string(),
    tradingName: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    taxNumber: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    primaryColor: v.string(),
    accentColor: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    physicalAddress: address,
    postalAddress: v.optional(address),
    countryCode: v.string(),
    locale: v.string(),
    timezone: v.string(),
    defaultCurrency: v.string(),
    defaultQuoteValidityDays: v.number(),
    defaultInvoiceDueDays: v.number(),
    defaultPaymentTerms: v.optional(v.string()),
    defaultFooter: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_org", ["organizationId"]),

  bankAccounts: defineTable({
    organizationId: v.id("organizations"),
    label: v.string(),
    currency: v.string(),
    bankName: v.string(),
    accountName: v.string(),
    accountNumber: v.string(),
    branchCode: v.optional(v.string()),
    accountType: v.optional(v.string()),
    swiftCode: v.optional(v.string()),
    isDefault: v.boolean(),
    archivedAt: v.optional(v.number()),
  }).index("by_org", ["organizationId"]),

  representatives: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    title: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    signatureStorageId: v.optional(v.id("_storage")),
    isDefault: v.boolean(),
    archivedAt: v.optional(v.number()),
  }).index("by_org", ["organizationId"]),

  clients: defineTable({
    organizationId: v.id("organizations"),
    clientType: v.union(v.literal("company"), v.literal("individual")),
    displayName: v.string(),
    legalName: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    taxNumber: v.optional(v.string()),
    contacts: v.array(contact),
    billingAddress: v.optional(address),
    physicalAddress: v.optional(address),
    defaultCurrency: v.optional(v.string()),
    defaultPaymentTermsDays: v.optional(v.number()),
    notes: v.optional(v.string()),
    searchText: v.string(),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_name", ["organizationId", "displayName"])
    .searchIndex("search_by_org", { searchField: "searchText", filterFields: ["organizationId"] }),

  employees: defineTable({
    organizationId: v.id("organizations"),
    employeeNumber: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(address),
    position: v.string(),
    department: v.optional(v.string()),
    managerEmployeeId: v.optional(v.id("employees")),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    employmentType: v.union(
      v.literal("permanent"), v.literal("fixed_term"), v.literal("part_time"),
      v.literal("contractor"), v.literal("intern"), v.literal("other"),
    ),
    employmentStatus: v.union(v.literal("active"), v.literal("leave"), v.literal("ended")),
    salaryMinor: v.optional(v.number()),
    salaryCurrency: v.optional(v.string()),
    salaryPeriod: v.optional(v.union(v.literal("hour"), v.literal("month"), v.literal("year"))),
    searchText: v.string(),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_employee_number", ["organizationId", "employeeNumber"])
    .searchIndex("search_by_org", { searchField: "searchText", filterFields: ["organizationId"] }),

  services: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    sku: v.optional(v.string()),
    description: v.optional(v.string()),
    billingType: v.union(
      v.literal("fixed"), v.literal("hourly"), v.literal("daily"),
      v.literal("monthly"), v.literal("per_unit"), v.literal("custom"),
    ),
    unitLabel: v.string(),
    basePriceMinor: v.number(),
    currency: v.string(),
    taxRateBasisPoints: v.number(),
    defaultDepositBasisPoints: v.optional(v.number()),
    defaultScope: v.optional(v.string()),
    defaultDeliverables: v.optional(v.array(v.string())),
    defaultExclusions: v.optional(v.array(v.string())),
    defaultTimeline: v.optional(v.string()),
    defaultWarranty: v.optional(v.string()),
    defaultSlaProfile: v.optional(v.any()),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_name", ["organizationId", "name"]),

  servicePackages: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    currency: v.string(),
    items: v.array(v.object({ serviceId: v.id("services"), quantityMilli: v.number(), position: v.number() })),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["organizationId"]),

  documentSequences: defineTable({
    organizationId: v.id("organizations"),
    documentType,
    prefix: v.string(),
    nextNumber: v.number(),
    padding: v.number(),
    resetPolicy: v.union(v.literal("never"), v.literal("yearly")),
    sequenceYear: v.optional(v.number()),
  }).index("by_org_type", ["organizationId", "documentType"]),

  documents: defineTable({
    organizationId: v.id("organizations"),
    type: documentType,
    number: v.optional(v.string()),
    title: v.string(),
    status: v.string(),
    clientId: v.optional(v.id("clients")),
    employeeId: v.optional(v.id("employees")),
    sourceDocumentId: v.optional(v.id("documents")),
    templateKey: v.string(),
    locale: v.string(),
    currency: v.optional(v.string()),
    issueDate: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    currentVersion: v.number(),
    searchText: v.string(),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
    archivedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_org_type", ["organizationId", "type"])
    .index("by_org_number", ["organizationId", "number"])
    .index("by_client", ["organizationId", "clientId"])
    .index("by_employee", ["organizationId", "employeeId"])
    .index("by_source", ["organizationId", "sourceDocumentId"])
    .searchIndex("search_by_org", { searchField: "searchText", filterFields: ["organizationId", "type"] }),

  quotes: defineTable({
    organizationId: v.id("organizations"),
    documentId: v.id("documents"),
    lineItems: v.array(lineItem),
    scope: v.optional(v.string()),
    deliverables: v.array(v.string()),
    exclusions: v.array(v.string()),
    timeline: v.optional(v.string()),
    paymentTerms: v.optional(v.string()),
    validityDays: v.number(),
    depositBasisPoints: v.number(),
    documentDiscountMinor: v.number(),
    notes: v.optional(v.string()),
    subtotalMinor: v.number(),
    discountMinor: v.number(),
    taxMinor: v.number(),
    totalMinor: v.number(),
    depositMinor: v.number(),
    balanceMinor: v.number(),
  }).index("by_document", ["documentId"]),

  invoices: defineTable({
    organizationId: v.id("organizations"),
    documentId: v.id("documents"),
    sourceQuoteId: v.optional(v.id("documents")),
    invoiceMode: v.union(v.literal("full"), v.literal("deposit"), v.literal("progress")),
    lineItems: v.array(lineItem),
    documentDiscountMinor: v.number(),
    bankAccountId: v.optional(v.id("bankAccounts")),
    paymentTerms: v.optional(v.string()),
    notes: v.optional(v.string()),
    subtotalMinor: v.number(),
    discountMinor: v.number(),
    taxMinor: v.number(),
    totalMinor: v.number(),
    amountPaidMinor: v.number(),
    balanceDueMinor: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_source_quote", ["organizationId", "sourceQuoteId"]),

  slaAgreements: defineTable({
    organizationId: v.id("organizations"),
    documentId: v.id("documents"),
    archetype: v.string(),
    effectiveDate: v.optional(v.string()),
    expiryDate: v.optional(v.string()),
    renewalType: v.union(v.literal("none"), v.literal("manual"), v.literal("automatic")),
    serviceIds: v.array(v.id("services")),
    serviceScope: v.string(),
    serviceLevels: v.array(v.object({
      priority: v.string(),
      definition: v.string(),
      responseTargetMinutes: v.optional(v.number()),
      resolutionTargetMinutes: v.optional(v.number()),
      coverageWindow: v.optional(v.string()),
    })),
    providerResponsibilities: v.array(v.string()),
    clientResponsibilities: v.array(v.string()),
    exclusions: v.array(v.string()),
    reportingTerms: v.optional(v.string()),
    feeTerms: v.optional(v.string()),
    clauses: v.array(v.object({ key: v.string(), heading: v.string(), body: v.string(), source: v.string(), position: v.number() })),
    governingLaw: v.optional(v.string()),
    representativeId: v.optional(v.id("representatives")),
  }).index("by_document", ["documentId"]),

  employeeLetters: defineTable({
    organizationId: v.id("organizations"),
    documentId: v.id("documents"),
    employeeId: v.id("employees"),
    letterType: v.union(
      v.literal("offer"), v.literal("employment_confirmation"), v.literal("promotion"),
      v.literal("salary_adjustment"), v.literal("warning"), v.literal("recommendation"),
      v.literal("leave_confirmation"), v.literal("termination"), v.literal("custom"),
    ),
    subject: v.string(),
    effectiveDate: v.optional(v.string()),
    fields: v.any(),
    sections: v.array(v.object({ key: v.string(), heading: v.optional(v.string()), body: v.string(), source: v.string(), position: v.number() })),
    representativeId: v.optional(v.id("representatives")),
  })
    .index("by_document", ["documentId"])
    .index("by_employee", ["organizationId", "employeeId"]),

  documentVersions: defineTable({
    organizationId: v.id("organizations"),
    documentId: v.id("documents"),
    version: v.number(),
    lifecycle: v.union(v.literal("draft"), v.literal("issued")),
    snapshot: v.any(),
    contentHash: v.string(),
    changeSummary: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_document_version", ["documentId", "version"])
    .index("by_org", ["organizationId"]),

  renderJobs: defineTable({
    organizationId: v.id("organizations"),
    documentId: v.id("documents"),
    documentVersionId: v.id("documentVersions"),
    status: v.union(v.literal("queued"), v.literal("rendering"), v.literal("succeeded"), v.literal("failed")),
    renderer: v.string(),
    templateKey: v.string(),
    storageId: v.optional(v.id("_storage")),
    checksum: v.optional(v.string()),
    pageCount: v.optional(v.number()),
    errorCode: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_document_version", ["documentVersionId"])
    .index("by_org_status", ["organizationId", "status"]),

  agentRuns: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("needs_clarification")),
    intent: v.optional(v.string()),
    redactedInput: v.string(),
    toolCalls: v.array(v.object({ name: v.string(), status: v.string(), targetId: v.optional(v.string()) })),
    resultingDocumentId: v.optional(v.id("documents")),
    errorCode: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_org", ["organizationId"]),

  auditEvents: defineTable({
    organizationId: v.id("organizations"),
    actorUserId: v.optional(v.id("users")),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    documentId: v.optional(v.id("documents")),
    metadata: v.optional(v.any()), // redacted, non-secret metadata only
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_entity", ["organizationId", "entityType", "entityId"])
    .index("by_document", ["documentId"]),

  eventLog: defineTable({
    organizationId: v.id("organizations"),
    eventId: v.string(),
    eventType: v.string(),
    version: v.number(),
    aggregateId: v.string(),
    aggregateType: v.string(),
    occurredAt: v.string(),
    actor: v.optional(v.object({
      type: v.union(v.literal("user"), v.literal("agent"), v.literal("system")),
      id: v.optional(v.string()),
    })),
    data: v.any(),
    metadata: v.object({
      correlationId: v.string(),
      causationId: v.optional(v.string()),
    }),
    deliveryStatus: v.union(v.literal("pending"), v.literal("published"), v.literal("failed")),
    deliveryAttempts: v.number(),
    lastErrorCode: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_org_status", ["organizationId", "deliveryStatus"])
    .index("by_event_id", ["eventId"])
    .index("by_aggregate", ["organizationId", "aggregateType", "aggregateId"]),

  jobs: defineTable({
    organizationId: v.id("organizations"),
    jobId: v.string(),
    jobType: v.string(),
    input: v.any(),
    status: v.union(
      v.literal("pending"), v.literal("queued"), v.literal("processing"),
      v.literal("completed"), v.literal("failed"), v.literal("cancelled"),
      v.literal("needs_review"),
    ),
    result: v.optional(v.any()),
    errorCode: v.optional(v.string()),
    retryCount: v.number(),
    idempotencyKey: v.string(),
    correlationId: v.string(),
    requestedBy: v.object({ type: v.union(v.literal("user"), v.literal("agent"), v.literal("system")), id: v.optional(v.string()) }),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_org_status", ["organizationId", "status"])
    .index("by_org_type", ["organizationId", "jobType"])
    .index("by_org_idempotency", ["organizationId", "idempotencyKey"]),

  idempotencyKeys: defineTable({
    organizationId: v.id("organizations"),
    key: v.string(),
    operation: v.string(),
    resultEntityId: v.optional(v.string()),
    expiresAt: v.number(),
  }).index("by_org_key", ["organizationId", "key"]),
});
```

Implementation note: `v.any()` above marks domain-specific JSON that must still be validated with versioned Zod schemas before it enters or leaves the database. It is not permission to store arbitrary unvalidated model output.

---

## 13. Domain Services and Server Commands

Organize business behavior as application commands that orchestrate framework-independent domain services instead of placing it in React components, Convex functions, automation scripts, or agent tools. Commands use imperative names; events use past-tense names.

Required commands:

```ts
createQuoteDraft(input)
updateQuoteDraft(input)
issueQuote(input)
transitionQuoteStatus(input)

createInvoiceDraft(input)
updateInvoiceDraft(input)
createInvoiceFromQuote(input)
issueInvoice(input)
recordInvoicePayment(input)
transitionInvoiceStatus(input)

createSlaDraft(input)
updateSlaDraft(input)
issueSla(input)
transitionSlaStatus(input)

createEmployeeLetterDraft(input)
updateEmployeeLetterDraft(input)
issueEmployeeLetter(input)
transitionEmployeeLetterStatus(input)

createDocumentVersion(input)
requestDocumentRender(input)
allocateDocumentNumber(input)
archiveDocument(input)
```

All commands must:

1. Resolve the authenticated user.
2. Verify active organization membership and permission.
3. Load all referenced records within the same organization.
4. Validate domain input.
5. Calculate derived values when applicable.
6. Apply an allowed state transition.
7. Write the record/version/event consistently.
8. Return typed identifiers and the new revision.

### 13.1 Calculation contract

```ts
type CalculationResult = {
  lines: Array<{
    id: string;
    grossMinor: number;
    discountMinor: number;
    netMinor: number;
    taxMinor: number;
    totalMinor: number;
  }>;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  depositMinor?: number;
  balanceMinor?: number;
};
```

Unit tests must cover zero values, fractional quantities, discounts, tax-inclusive/exclusive policy if enabled, deposit rounding, and maximum supported amounts.

### 13.2 Ports, transactions, and event publication

The application core defines the contracts it needs:

```ts
interface EventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}

interface MessageBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventType: string, handler: EventHandler<T>): void;
}

interface JobQueue {
  enqueue<T>(job: Job<T>): Promise<{ jobId: string }>;
}
```

For critical state changes, the application writes the state change and an outbox/event-log record in one transaction. A dispatcher publishes pending records and marks them delivered. Consumers are idempotent and may receive a message more than once. MVP may use an in-process dispatcher plus durable Convex records; an external broker is deferred until independently justified.

### 13.3 Canonical event envelope

```ts
type DomainEvent<T> = {
  eventId: string;
  eventType: string;
  version: number;
  aggregateId: string;
  aggregateType: string;
  occurredAt: string;
  actor?: { type: "user" | "agent" | "system"; id?: string };
  data: T;
  metadata: { correlationId: string; causationId?: string };
};
```

Events are immutable facts. Consumers may rely on existing fields, so fields are added compatibly; removal or renaming requires a new event version. External events are validated at the adapter boundary.

Initial events include `DocumentDraftCreated`, `DocumentVersionCreated`, `QuoteAccepted`, `InvoiceIssued`, `DocumentStatusChanged`, `RenderRequested`, `RenderCompleted`, `AgentDraftCreated`, and `LegacyImportRequested`.

### 13.4 Jobs and failure handling

Use tracked jobs for PDF rendering, legacy import, expiry/overdue sweeps, and asynchronous agent runs. Job records must include `jobId`, `jobType`, input reference, status, retry count, correlation ID, timestamps, redacted error details, and idempotency key.

Required statuses are `pending`, `queued`, `processing`, `completed`, `failed`, `cancelled`, and `needs_review`. Workers use bounded exponential retries, timeouts, and idempotent handlers. Permanent failures become visible `failed` or `needs_review` states; they must not silently disappear or mutate authoritative document state.

---

## 14. Mastra Document Agent

### 14.1 Agent mandate

The Document Agent helps users find records, create drafts, and draft/rewrite narrative content. It is not allowed to invent persisted entities, calculate authoritative totals, or finalize a legally/financially meaningful action.

### 14.2 Required output envelope

```ts
type DocumentAgentResult =
  | {
      kind: "draft_created";
      documentId: string;
      summary: string;
      assumptions: string[];
      missingFields: string[];
      sourceRecordIds: string[];
    }
  | {
      kind: "clarification_required";
      question: string;
      choices?: Array<{ id: string; label: string }>;
    }
  | {
      kind: "content_suggestion";
      targetSection: string;
      proposedText: string;
      warnings: string[];
    }
  | {
      kind: "not_allowed";
      reason: string;
      suggestedSafeAction?: string;
    };
```

### 14.3 Read tools

```ts
searchClients({ query, limit })
getClient({ clientId })
searchEmployees({ query, limit })
getEmployeeForDocument({ employeeId, fields })
listServices({ query?, currency?, limit })
getService({ serviceId })
getLatestAcceptedQuote({ clientId })
getQuote({ quoteDocumentId })
getInvoice({ invoiceDocumentId })
getSla({ slaDocumentId })
getCompanyDefaults()
listDocumentTemplates({ documentType })
```

Each tool derives organization context from the authenticated run; the model cannot choose another organization ID.

### 14.4 Draft/write tools

```ts
createQuoteDraft({ clientId, items, narrativeHints?, idempotencyKey })
createInvoiceDraft({ clientId, items, terms?, idempotencyKey })
createInvoiceFromQuote({ quoteDocumentId, mode, progressBasisPoints?, idempotencyKey })
createSlaDraft({ clientId, serviceIds, structuredTerms, draftedSections?, idempotencyKey })
createEmployeeLetterDraft({ employeeId, letterType, structuredFields, draftedSections?, idempotencyKey })
suggestSectionRewrite({ documentId, sectionKey, instruction })
```

These tools invoke domain services. They do not write tables directly.

### 14.5 Explicitly forbidden agent tools

- `issueDocument`
- `deleteDocument`
- `voidInvoice`
- `markInvoicePaid`
- `changeBankAccount`
- `changeEmployeeSalary`
- `sendDocument`
- Any raw database query or arbitrary code execution tool

### 14.6 Agent rules

- Create drafts only.
- Identify which stored records were used.
- Return assumptions and missing fields.
- Never expose another organization’s data.
- Never put secret banking values or full salary data into model prompts unless explicitly required and authorized.
- Never calculate authoritative totals; call the domain command.
- Never state that an SLA or employment letter is legally compliant.
- If two clients/employees/documents match, ask the user to choose.
- If the user names no source quote and multiple accepted quotes are plausible, ask.
- Treat model-produced clauses as untrusted draft strings and validate size/allowed formatting.

### 14.7 Prompt architecture

Use a short stable system prompt containing role, restrictions, tool-use policy, output contract, and document-specific cautions. Supply only the records required for the current action through tools. Do not inject the entire organization database, full previous documents, or HTML templates into the prompt.

### 14.8 Agent boundary and event flow

Mastra is an outer adapter. It may interpret a request and call an approved application tool, but it must never write Convex tables directly or publish authoritative domain events. The flow is:

```text
User request
  → Mastra interprets intent
  → approved tool invokes an application command
  → application authorizes and validates
  → domain state changes and event log entry are recorded
  → optional job is created for long-running work
  → agent receives a typed result and summarizes it
```

`AgentDraftCreated` may be published only after the draft command succeeds. Agent runs must record correlation and causation IDs, redacted input, tool outcomes, and resulting document/job IDs. Critical actions remain explicit user/application commands even if an agent suggests them.

---

## 15. PDF Rendering Architecture

### 15.1 Rendering decision

Use `pdfcn` as source-owned PDF components and Takumi as the first renderer. Do not couple domain models directly to a specific community invoice block. Adapt the chosen blocks behind BizDoc X render-model mappers.

```ts
type DocumentRenderer<T> = {
  render(input: T, options: RenderOptions): Promise<RenderResult>;
};

type RenderResult = {
  bytes: Uint8Array;
  mimeType: "application/pdf";
  checksum: string;
  pageCount?: number;
};
```

### 15.2 Rendering pipeline

```ts
document/version
  -> validate versioned snapshot
  -> map to DocumentRenderModel
  -> resolve template key and template version
  -> render with controlled React PDF component
  -> store bytes
  -> record checksum and renderer metadata
```

Issuance must not depend on an external renderer being immediately available. Issuance commits the immutable version and creates a `RenderDocumentJob`/`RenderRequested` event. The render worker claims the job, applies bounded retries, stores the artifact, and publishes `RenderCompleted`. A user-facing download is enabled only when the authoritative artifact for that version is available.

### 15.3 Preview strategy

Use a two-level preview:

- Fast structured HTML/React preview while editing, built from the same render model.
- Debounced or user-triggered authoritative PDF preview after material changes.

The PDF remains the issuance artifact. The fast preview must clearly indicate when it is updating or when the authoritative PDF is stale.

### 15.4 Template keys

```text
invoice/modern@1
invoice/corporate@1
invoice/minimal@1
quote/modern@1
quote/corporate@1
quote/minimal@1
sla/technology@1
sla/general@1
employee-letter/standard@1
```

Templates are versioned because layout changes can affect page breaks and exact historical reproduction.

### 15.5 Initial source-owned structure

```text
src/pdf/
├── contracts/
│   ├── render-model.ts
│   └── renderer.ts
├── mappers/
│   ├── invoice-render-model.ts
│   ├── quote-render-model.ts
│   ├── sla-render-model.ts
│   └── employee-letter-render-model.ts
├── primitives/
│   ├── company-header.tsx
│   ├── recipient-block.tsx
│   ├── metadata-block.tsx
│   ├── items-table.tsx
│   ├── totals-block.tsx
│   ├── bank-details.tsx
│   ├── clause-section.tsx
│   ├── signature-block.tsx
│   └── page-footer.tsx
├── templates/
│   ├── invoice/
│   ├── quote/
│   ├── sla/
│   └── employee-letter/
├── themes/
│   ├── modern.ts
│   ├── corporate.ts
│   └── minimal.ts
└── server/
    ├── render-document.ts
    └── template-registry.ts
```

### 15.6 Rendering tests

- Unit-test render-model mappers.
- Snapshot-test normalized render models, not raw binary PDFs.
- Render golden sample PDFs in CI.
- Extract text from generated PDFs and assert required values.
- Render pages to images and use visual regression thresholds for template changes.
- Test long names, long addresses, 30 line items, multipage SLAs, missing optional fields, and signature placement.

---

## 16. Proposed Next.js Repository Structure

The existing repository should be upgraded in place, preferably on a new migration branch, while preserving Git history.

```text
bizdoc-x/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (workspace)/[organizationSlug]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── documents/page.tsx
│   │   ├── quotes/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── slas/page.tsx
│   │   ├── employee-letters/page.tsx
│   │   ├── clients/
│   │   ├── employees/
│   │   ├── services/
│   │   ├── templates/page.tsx
│   │   └── settings/
│   ├── api/
│   │   ├── agent/route.ts
│   │   └── render/[documentId]/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── app-shell/
│   ├── command-bar/
│   ├── data-tables/
│   ├── document-editor/
│   │   ├── editor-shell.tsx
│   │   ├── financial-editor.tsx
│   │   ├── sla-editor.tsx
│   │   ├── employee-letter-editor.tsx
│   │   ├── live-preview.tsx
│   │   └── issue-dialog.tsx
│   ├── forms/
│   └── ui/
├── convex/
│   ├── _generated/
│   ├── schema.ts
│   ├── auth.ts
│   ├── authorization.ts
│   ├── organizations.ts
│   ├── clients.ts
│   ├── employees.ts
│   ├── services.ts
│   ├── documents.ts
│   ├── quotes.ts
│   ├── invoices.ts
│   ├── slas.ts
│   ├── employeeLetters.ts
│   ├── renderJobs.ts
│   ├── audit.ts
│   └── domain/
│       ├── calculations.ts
│       ├── numbering.ts
│       ├── snapshots.ts
│       ├── transitions.ts
│       └── permissions.ts
├── src/
│   ├── agent/
│   │   ├── document-agent.ts
│   │   ├── schemas.ts
│   │   ├── prompts.ts
│   │   └── tools/
│   ├── domain/
│   │   ├── documents/
│   │   ├── money/
│   │   └── shared/
│   ├── pdf/
│   ├── validation/
│   └── lib/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── pdf-golden/
├── scripts/
│   └── migrate-localstorage-export.ts
├── public/
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── package.json
└── README.md
```

Rule: UI code may call public Convex queries/mutations or application services. It must not contain numbering, totals, permission, or lifecycle logic.

### 16.1 Capability ownership

Major business capabilities own their domain rules, use cases, events, adapters, and tests. Shared modules are limited to genuinely shared concepts such as money, identity context, event envelopes, clock, error contracts, and pagination. Do not create a generic `utils` or shared data model that becomes a dependency magnet.

Recommended capability structure:

```text
src/
├── domain/
│   ├── organization/
│   ├── catalog/
│   ├── documents/
│   ├── financial/
│   ├── hr/
│   └── sla/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── ports/
│   ├── dto/
│   └── handlers/
├── adapters/
│   ├── http/
│   ├── convex/
│   ├── agent/
│   ├── messaging/
│   ├── jobs/
│   └── presenters/
├── infrastructure/
│   ├── convex/
│   ├── mastra/
│   ├── pdf/
│   ├── storage/
│   ├── windmill/
│   └── observability/
└── composition/
```

The exact folder names may vary, but dependency direction and capability ownership are mandatory. The composition root is the only place that assembles concrete adapters and infrastructure implementations.

### 16.2 Coupling controls

- Operational coupling: PDF rendering, model calls, and Windmill must not block core document commands; use jobs, timeouts, retries, and visible pending/failed states.
- Developmental coupling: UI, agents, automations, and persistence must not share internal schemas; use DTOs, mappers, ports, and versioned contracts.
- Semantic coupling: define a canonical glossary for document types, statuses, issued/accepted/paid/active meanings, and organization roles.
- Functional coupling: totals, permissions, numbering, and lifecycle validation each have one authoritative implementation.
- Incidental coupling: do not parse UI labels, raw HTML, free-text model output, filenames, or unversioned webhook payloads in critical workflows.

### 16.3 Responsibility rule

The UI displays and collects input. The application layer authorizes, validates, orchestrates, records events, and creates jobs. The domain layer owns invariants and business meaning. Mastra proposes or drafts through approved tools. Workers process durable jobs. Infrastructure implements ports. No outer layer may bypass the application boundary to mutate core state.

---

## 17. UI Specification

### 17.1 Visual direction

Use the warmer Innovation Imperial product language rather than the prototype’s generic indigo dashboard:

- Warm paper/off-white document canvas
- Charcoal navigation and typography
- Restrained orange accent for creation and AI actions
- Clear financial/status colors used accessibly
- Dense enough for business operations, but not accounting-software complexity

### 17.2 Desktop editor

Left pane:

- Document metadata
- Recipient selector
- Structured fields/line items/sections
- AI rewrite actions scoped to a selected section
- Save state and validation

Right pane:

- A4 preview
- Page controls and zoom
- Template switcher
- Refresh authoritative PDF
- Download

Top actions:

- Back
- Status badge
- Duplicate
- Version history
- Issue/transition action

### 17.3 Command bar

Suggested examples are contextual:

- “Create a quote for…”
- “Invoice [client] from their latest accepted quote.”
- “Draft an SLA for…”
- “Create a promotion letter for…”

After execution, display source records, assumptions, missing fields, and a clear “Open draft” action.

### 17.4 Empty states

Empty states should teach the relationship between records:

- No invoices: create standalone or convert an accepted quote.
- No services: add reusable services to create quotes faster.
- No clients: create one inline during document creation.
- No employees: add one before issuing a personalized letter.

---

## 18. Validation and Business Rules

### 18.1 General issuance requirements

- Complete company legal/trading name and contact information
- Valid recipient association
- Selected active template
- Valid issue date
- Authorized representative where signature block requires one
- No unresolved required fields or agent placeholders
- Successful authoritative render before final issue confirmation

### 18.2 Quote

- At least one line item
- Positive quantity and non-negative price
- One currency across line items
- Valid-until date cannot precede issue date
- Deposit range 0–10000 basis points
- Accepted/rejected transitions require an issued quote

### 18.3 Invoice

- At least one line item
- Due date cannot precede issue date unless explicitly supported later
- Amount paid cannot be negative or exceed total without credit handling
- Paid status derives from recorded amount in MVP; do not let the model set it
- Invoice created from a quote stores source ID and conversion mode
- Issued invoice financial facts cannot be edited; use void/replacement or credit-note support later

### 18.4 SLA

- Client, service scope, effective date, term/expiry behavior, responsibilities, termination terms, governing law field or explicit “not specified” review warning
- Response and resolution values are optional but, when supplied, are structured durations
- AI-produced clauses may not contain unresolved tokens such as `[[...]]`

### 18.5 Employee letter

- Employee and letter type
- Subject, date, authorizing representative
- Type-specific required fields
- Salary values use money rules and restricted permission
- Warning/termination issue dialog requires explicit acknowledgment of review responsibility

---

## 19. Migration from AI Agreement Generator

### 19.1 Preserve

- Company profile concept
- Company logo
- Clients
- Item packages and their items
- Invoice and quote sequence starting points
- Saved document-set metadata where recoverable
- Existing document content as read-only legacy artifacts when imported

### 19.2 Replace

| Existing implementation | Replacement |
|---|---|
| Vite single-page structure | Next.js App Router workspace |
| `localStorage` records | Convex organization-scoped tables |
| Gemini raw HTML | Mastra structured intent/content suggestions |
| Regex document parsing | Typed result envelopes and domain commands |
| `innerHTML`/`contenteditable` | Structured controlled editors |
| Model-calculated totals | Tested server domain calculator |
| Browser counters | Server-authoritative sequence allocator |
| `html2pdf`/`html2canvas` | `pdfcn` + Takumi rendering |
| Saved HTML blobs | Versioned document snapshots and render artifacts |

### 19.3 Import approach

Because browser `localStorage` is device-local, server migration cannot fetch it automatically. Add a temporary migration screen to the legacy app or a script users can run in the browser:

1. Export known keys to a JSON file.
2. Validate against a `LegacyExportV1` schema.
3. Upload into the new application.
4. Show a dry-run summary and conflicts.
5. Import company, clients, packages, and counters.
6. Store saved HTML documents as sanitized, read-only legacy attachments with type/date/client metadata; do not inject them into the new editor.
7. Record import audit event and source checksum.

Never blindly execute or render imported HTML.

### 19.4 Repository strategy

- Keep the existing GitHub repository and history.
- Create a `bizdoc-x-migration` branch.
- Archive the final prototype state with a tag such as `legacy-vite-mvp`.
- Replace the application incrementally on the migration branch.
- Do not copy the entire `pdfcn` repository. Install/copy only the selected source-owned components and required renderer dependencies according to its registry model and MIT license obligations.

---

## 20. Delivery Plan

### Phase 0 — Foundation and decisions

- Tag legacy MVP and create migration branch
- Bootstrap Next.js, TypeScript, Tailwind, shadcn/ui
- Initialize Convex and authentication adapter
- Establish organization authorization helpers
- Establish domain/application/adapter/infrastructure dependency rules
- Define versioned command, event, and job contracts
- Add the transactional event log/outbox dispatcher with an in-process MVP implementation
- Add lint, typecheck, unit test, and CI baseline
- Prove a minimal server-rendered PDF spike with one adapted `pdfcn`/Takumi invoice

**Exit gate:** authenticated user can create an organization and render/download a static branded sample invoice in the target deployment environment.

### Phase 1 — Business data

- Company profile, banking profiles, representatives
- Clients
- Employees with scoped salary access
- Services and packages
- Number-sequence settings
- Settings/onboarding UI

**Exit gate:** all records persist in Convex, are isolated by organization, and pass CRUD/authorization tests.

### Phase 2 — Quote and invoice vertical slice

- Money calculator
- Quote editor/status/versioning
- Invoice editor/status/versioning
- Quote-to-invoice modes and idempotency
- Quote and invoice domain events with idempotent consumers
- Modern/corporate/minimal invoice and quote templates
- Authoritative PDF render/download
- Dashboard financial/status summaries by currency

**Exit gate:** a user can create and issue a quote, accept it, convert it to a deposit invoice, issue and download both PDFs, with correct totals and immutable snapshots.

### Phase 3 — Employee letters and SLAs

- Employee letter forms and standard template
- General and technology SLA forms/templates
- Clause/section model
- Type-specific validation and legal-review warnings
- Multipage PDF tests

**Exit gate:** every initial letter type and both SLA archetypes can be drafted, validated, issued, versioned, and downloaded.

### Phase 4 — Mastra Document Agent

- Agent endpoint and authenticated run context
- Read/search tools
- Draft-only write tools
- Entity ambiguity handling
- Section drafting/rewriting
- Agent run audit and redaction
- Command-bar interface

**Exit gate:** natural-language test scenarios create the correct drafts, never issue documents, and request clarification for ambiguous entities.

### Phase 5 — Migration, hardening, and release

- Legacy export/import
- Durable job lifecycle, retry, and needs-review handling
- Event contract and dependency-direction verification
- Golden PDF suite and visual QA
- E2E coverage
- Sentry/observability
- Rate limiting and security review
- Docker/Dokploy deployment
- Backups/recovery runbook
- User documentation and seeded Innovation Imperial demo workspace

**Exit gate:** release checklist passes, imported core records reconcile, and a clean organization can complete onboarding and all primary flows in production.

---

## 21. MVP Acceptance Criteria

### Product

- [ ] A user can create and switch between organizations they belong to.
- [ ] Organization data cannot be accessed with another organization’s record IDs.
- [ ] Company profile, clients, employees, services, and packages persist across devices.
- [ ] A quote can be created from catalog and custom items.
- [ ] Quote totals are calculated without an LLM.
- [ ] An accepted quote converts to a full, deposit, or progress invoice draft.
- [ ] A standalone invoice can be created.
- [ ] An SLA can be built from structured service-level terms.
- [ ] Every listed employee-letter type can produce a draft.
- [ ] Templates can be changed without changing document data.
- [ ] Every issued document has a unique server-generated number.
- [ ] Every issued document has an immutable version snapshot.
- [ ] A PDF can be regenerated from the issued snapshot and template version.
- [ ] Documents can be searched by number, recipient, and type.
- [ ] Status transitions reject invalid state changes.
- [ ] Audit events exist for material actions.

### AI

- [ ] Agent responses conform to a typed result envelope.
- [ ] Agent can search clients/employees/services and create drafts.
- [ ] Agent asks for clarification on ambiguous matches.
- [ ] Agent cannot issue, void, mark paid, delete, or change bank/salary records.
- [ ] Model output is never inserted as raw HTML.
- [ ] Agent assumptions and source records are visible to the user.
- [ ] Financial totals generated by the application match direct domain-calculator results.

### PDF

- [ ] A4 output is visually verified for every initial template.
- [ ] Required company/recipient/document fields appear correctly.
- [ ] 30-line invoices and long SLAs paginate without clipped content.
- [ ] PDF text is selectable/searchable where supported by the renderer.
- [ ] Issued PDFs include document number and version-linked checksum metadata in storage records.
- [ ] Failed renders can be retried without duplicating an issued document.

### Operations

- [ ] Production deployment uses server-side secrets.
- [ ] Errors are observable without leaking document content.
- [ ] Backup and restore procedure is documented and tested.
- [ ] Legacy import produces a preview and audit record.

### Architecture

- [ ] Domain rules run in tests without Convex, Next.js, Mastra, Windmill, PDF libraries, or model-provider SDKs.
- [ ] Domain/application imports point inward; an automated dependency check fails on outward imports or cycles.
- [ ] Convex, Mastra, Windmill, storage, and PDF implementations are replaceable adapters behind ports.
- [ ] Critical commands record state changes and domain events atomically in the event log/outbox.
- [ ] Event envelopes and job payloads are versioned, validated, immutable, and correlation-aware.
- [ ] Event consumers and jobs are idempotent and tolerate duplicate delivery.
- [ ] Background failures are visible, retryable, and end in `failed` or `needs_review` rather than being silently dropped.
- [ ] The composition root wires concrete implementations; inner layers instantiate no infrastructure.
- [ ] Architecture review satisfies all seven dependency-rule diagnostic checks.

---

## 22. Test Plan

### 22.1 Unit tests

- Money arithmetic and rounding
- Percentage/deposit calculations
- Sequence formatting and yearly reset
- Status transition matrices
- Permission rules
- Snapshot builder and content hash
- Render-model mappers
- Zod schemas for agent and legacy import
- Domain event creation and status semantics

### 22.2 Integration tests

- Authenticated organization isolation
- Draft creation and version updates
- Atomic issuance and number allocation
- Quote conversion idempotency
- Payment/status derivation
- Agent tool → domain service boundary
- Render job lifecycle and storage association
- Event log/outbox publication and retry behavior
- Duplicate and out-of-order event delivery handling
- Job idempotency, timeout, retry, and `needs_review` transitions
- Architecture dependency-direction and cycle checks

### 22.3 End-to-end scenarios

1. Innovation Imperial creates a ZAR quote for Megasol, accepts it, and creates a 40% deposit invoice.
2. A Lesotho organization creates an LSL standalone invoice without mixing currencies.
3. User requests “invoice Mega…” with two matching clients and receives a clarification choice.
4. HR creates a promotion letter and Finance cannot access the salary field without permission.
5. User switches a quote from Modern to Corporate; data and totals remain identical.
6. Long technology SLA renders across multiple pages with headers/footers and signatures intact.
7. A user from Organization A attempts to load Organization B’s document ID and receives no data.
8. Agent attempts an unsupported “mark invoice paid” action and returns `not_allowed`.

---

## 23. Seed Data for the Development Workspace

Seed only development/test environments with synthetic or approved demo information.

Suggested demo services:

- Website Development
- AI Automation
- CRM Development
- AI Agent Development
- Hosting
- Maintenance
- Technical Support

Suggested package:

```text
E-commerce Launch
- E-commerce website: R8,000
- Hosting: R1,200/year
- Maintenance: R750/month
- Deposit: 40%
```

Do not commit real bank account data, personal employee data, client secrets, or production API keys to the repository.

---

## 24. Environment Contract

Document exact names in `.env.example` without values. Final names depend on the selected auth/model/storage integrations, but the implementation must separate public and server-only variables.

Minimum categories:

```text
# Public application/Convex deployment references
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CONVEX_URL=

# Authentication — provider-specific, server secret values excluded from client bundle
AUTH_...=

# AI provider
GOOGLE_GENERATIVE_AI_API_KEY=

# Observability
SENTRY_...=
OTEL_...=

# Optional automation integration
WINDMILL_...=
```

Never expose provider API keys through `NEXT_PUBLIC_*`. The existing prototype’s build-time `process.env.API_KEY` browser usage must not be retained.

---

## 25. Build Instructions for the Coding Agent

The coding agent should treat this PRD as the authority for product scope and architecture.

### Mandatory execution order

1. Inspect the existing repository and preserve unrelated/user-authored changes.
2. Record current build behavior and tag/branch strategy before restructuring.
3. Build a renderer spike before committing the whole application to a PDF integration.
4. Establish authentication, organization context, and authorization helpers before feature CRUD.
5. Implement money and lifecycle domain tests before quote/invoice UI.
6. Build quote → invoice as the first complete vertical slice.
7. Add SLA and employee letters.
8. Add Mastra only after deterministic commands are stable.
9. Add legacy import after the target schemas stabilize.
10. Run typecheck, unit, integration, E2E, production build, and PDF visual verification before handoff.

### Non-negotiable prohibitions

- Do not ask the LLM to emit HTML, JSX, CSS, totals, IDs, or authoritative dates.
- Do not use `dangerouslySetInnerHTML` for generated or imported content.
- Do not store application records in `localStorage`; UI preferences may use it.
- Do not let agent tools bypass domain services.
- Do not authorize from client-side role state.
- Do not mutate issued version snapshots.
- Do not use floating-point money.
- Do not mix currencies in totals.
- Do not log sensitive document bodies, full bank values, credentials, or salary values.
- Do not silently expand scope into payments, accounting, payroll, emailing, or signatures.

### Required handoff artifacts

- Updated application code
- `README.md` with local/deployment instructions
- `.env.example`
- Architecture decision records for PDF renderer, auth, money rounding, and document versioning
- Convex schema and indexes
- Seed script with non-sensitive demo data
- Legacy export/import instructions
- Automated test report
- PDF visual-regression samples
- Deployment and rollback runbook
- Known limitations and Phase 2 backlog

---

## 26. Post-MVP Roadmap

Prioritize only after MVP usage validates demand:

1. Email delivery and tracked public document links
2. Electronic acceptance/signatures
3. Payment links and payment-provider reconciliation events
4. Automated reminders and overdue workflows through Windmill
5. Recurring invoices
6. Proposals and statements of work
7. Credit notes
8. Client portal
9. Custom template designer with constrained blocks
10. Team approval workflows
11. Import from spreadsheets/accounting platforms
12. Template/industry packs

Avoid general-ledger expansion unless the product strategy deliberately changes.

---

## 27. Success Metrics

Initial product metrics:

- Time from onboarding to first issued document
- Median time to create quote/invoice
- Percentage of accepted quotes converted without re-entry
- Draft-to-issued completion rate by document type
- PDF render success rate and p95 time
- Agent draft acceptance rate
- Agent clarification rate and incorrect-entity rate
- Weekly active organizations
- Documents created per active organization
- Percentage of documents using reusable services/client records

Guardrail metrics:

- Cross-organization authorization failures
- Duplicate document-number incidents
- Calculation discrepancies
- Issued-document reproduction failures
- AI actions blocked by policy
- Sensitive-data leakage incidents

---

## 28. Final Product Definition

BizDoc X is successful when a business can store its core operational facts once and reliably turn them into connected, branded documents.

The defining workflow is:

```text
Company + Client + Service
          ↓
        Quote
          ↓ accepted
        Invoice

Service + Structured Terms → SLA
Employee + Structured Event → Employee Letter

The domain protects meaning, invariants, calculations, and transitions.
Application commands authorize, orchestrate, and record facts.
Convex implements persistence, realtime state, and the durable event log/outbox.
Events connect audit, rendering, read models, and future integrations without direct module coupling.
Jobs make rendering, imports, and sweeps observable and retryable.
Mastra interprets and drafts through approved tools.
pdfcn/Takumi renders through a replaceable adapter.
The user reviews and explicitly issues.
```

That separation, the inward dependency rule, and the explicit command/event/job contracts are the foundation of the product and must remain intact throughout implementation.
