# Document workflow UX design

## Scope

Complete the non-authenticated document workflow after the Convex, Mastra, and Takumi migration:

- let a user open a draft created by Mastra;
- show the authoritative PDF state beside the issued document;
- provide a preview/download action when the artifact is ready;
- make queued, rendering, ready, and failed states understandable;
- add focused regression coverage for render identity, financial line mapping, and assistant envelopes.

Authentication, organization membership, email delivery, signatures, and payment collection remain out of scope.

## Architecture

Convex remains the durable source of truth. Issuance still commits the immutable version and schedules the PDF job. The render query adapter will enrich each job with its document and version identity, but it will not alter document state. The UI will use that identity to associate a ready artifact with the exact issued version that produced it.

Mastra remains an outer adapter. Its constrained result envelope already returns a created document ID, assumptions, missing fields, and source IDs. The UI will retain that result and expose an explicit `Open draft` action; it will never infer or issue a document from prose.

## Components and data flow

1. `convex/render.ts` returns job status, document ID, version number, storage URL, checksum, and page count.
2. `pages/BackendDocuments.tsx` matches the latest job to each document and renders a clear state label.
3. A created Mastra draft appears through the realtime documents query. `Open draft` loads that exact record into the existing editor.
4. A ready artifact is opened in a new browser tab through a normal PDF link. Pending and failed states show progress or the existing retry action.
5. Financial PDF line amounts continue to come from the domain calculation mapper, not UI or model output.

## Error handling

- No document is opened unless its ID came from a successful application tool result.
- No PDF link is shown without a completed job URL for the matching version.
- Failed render jobs remain visible and retryable; authoritative document state is unchanged.
- Assistant clarification and not-allowed results remain explanatory and do not mutate the editor.

## Testing

- Extend the live Convex test to verify render identity and the completed artifact metadata.
- Add mapper tests for tax/discount line totals and narrative preservation.
- Keep the architecture, domain, Convex integration, and production-build checks green.
- Visually inspect a generated A4 PDF after renderer changes.

## Acceptance criteria

- A Mastra-created quote, invoice, SLA, or employee-letter draft can be opened directly from the assistant result.
- Each issued document clearly reports queued, rendering, ready, or failed PDF state.
- Ready PDFs open/download from the matching issued version only.
- No authentication or delivery behavior is introduced.
