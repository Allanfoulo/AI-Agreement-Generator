# Convex migration status

Brief Doc X now uses Convex for the live workspace, business records, realtime document queries, event log/audit delivery, immutable issued versions, PDF jobs, storage URLs, catalog data, and legacy imports. No Supabase client or browser AI provider remains in the active application.

## Implemented phases

- Foundation: domain/application boundaries, ports, event contracts, Convex schema, fail-closed development access, and architecture test.
- Business data: workspace profile, clients, packages, employees, services, legacy document sets, and server-side sequences.
- Quote/invoice slice: integer minor-unit totals, optimistic revisions, idempotent saves/payments/conversions, concurrent-safe issuance, immutable snapshots, event delivery, and PDF checksum storage.
- Letters/SLAs: employee-letter and SLA document types share the validated draft/issue/version/render pipeline.
- Agent boundary: Mastra runs server-side, returns constrained narrative suggestions or clarification results, records agent-run lifecycle events, and cannot issue, pay, delete, or mutate sensitive facts.
- Hardening: bounded render retries, visible job failures, expiry/overdue sweep, checksum-linked artifacts, legacy preview/import with checksum dedupe, sanitised legacy editing, dependency-direction test, and live integration coverage.

## Authentication boundary

Authentication and organization membership are intentionally not included in this migration pass. The current local deployment is a single shared development workspace and must not be exposed as production data. `requireDevelopment()` protects every public function until a Convex-compatible identity adapter and organization-membership checks are added.

## Legacy import

Open **Import existing data** in the app. Preview reads the old browser records, computes a SHA-256 export key, and sends a validated dry run to Convex. The commit is idempotent, preserves browser originals, deduplicates records, and writes an audit event.
