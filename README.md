<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1o_sHFCuYFJqrhlLT5Uw9T4fWyvbfHHxF

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Architecture foundation

The current Vite prototype is being migrated incrementally toward the architecture defined in [docs/BizDoc-X-PRD.md](docs/BizDoc-X-PRD.md).

- `src/domain` contains framework-independent business rules for money and document lifecycles.
- `src/application` contains use cases and ports.
- `src/infrastructure` contains replaceable event and persistence implementations.
- `src/composition` wires concrete implementations together.
- `tests` covers the domain and application foundation.

Critical state changes are designed to publish typed, versioned events through an outbox boundary. The current implementation uses an in-memory adapter as the MVP seam; Convex persistence and durable delivery belong to the next migration phase.

Run the architecture tests directly with:

```bash
node --test --experimental-strip-types tests/domain.test.ts
```
