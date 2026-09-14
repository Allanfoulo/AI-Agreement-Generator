<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# BizDoc X

BizDoc X is a structured business-document workspace. Convex is the backend and source of truth; browser storage is used only as an explicit legacy-import source.

Convex is started separately so backend functions can be validated locally.

## Run Locally

**Prerequisites:** Node.js 20+


1. Install dependencies: `npm install`
2. Start the local Convex deployment once: `npx convex dev --once`
3. Enable the explicitly shared, unauthenticated development workspace: `npx convex env set BIZDOC_ALLOW_UNAUTHENTICATED true`
4. Run the app: `npm run dev` and keep `npx convex dev` running in a second terminal.

Authentication is intentionally deferred, per the migration request. All public Convex functions fail closed unless `BIZDOC_ALLOW_UNAUTHENTICATED=true` is set in the development deployment. Do not use this mode for production data.

## Architecture foundation

The current Vite prototype is being migrated incrementally toward the architecture defined in [docs/BizDoc-X-PRD.md](docs/BizDoc-X-PRD.md).

- `src/domain` contains framework-independent business rules for money and document lifecycles.
- `src/application` contains use cases and ports.
- `src/infrastructure` contains replaceable event and persistence implementations.
- `src/composition` wires concrete implementations together.
- `convex` contains persistence, realtime queries, the durable event log, idempotent commands, PDF workers, imports, sweeps, and the Mastra boundary.
- `tests` covers domain rules, dependency direction, and live Convex flows.

Critical state changes publish versioned event-log records and schedule idempotent audit delivery. Issuance snapshots the authoritative document before queuing PDF rendering; the worker stores a checksum-linked artifact and retries bounded failures.

Run the architecture tests directly with:

```bash
node --test --experimental-strip-types tests/domain.test.ts tests/architecture.test.mjs
```

Run the end-to-end Convex check while the local backend is active:

```bash
node tests/convex.integration.mjs
```
