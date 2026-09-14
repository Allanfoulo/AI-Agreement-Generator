import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('inner layers do not depend on outer frameworks', async () => {
  const files = [
    'src/domain/documents/lifecycle.ts',
    'src/domain/events/domain-event.ts',
    'src/domain/financial/money.ts',
    'src/application/ports.ts',
    'src/application/commands/create-quote-draft.ts',
    'src/application/commands/save-document-set.ts',
    'src/application/commands/delete-document-set.ts',
  ];
  const forbidden = /from ['"](?:.*\/)?(?:convex|react|mastra|pdf-lib|@google\/genai|dompurify)/i;
  for (const file of files) assert.doesNotMatch(await readFile(file, 'utf8'), forbidden, file);
});
