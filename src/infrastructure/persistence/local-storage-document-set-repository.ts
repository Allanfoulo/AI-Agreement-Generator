import type { DocumentSetRepository, SavedDocumentSetRecord } from "../../application/ports.ts";

const STORAGE_KEY = "bizdoc_saved_document_sets";
const MAX_DOCUMENT_SETS = 1_000;
const MAX_HTML_LENGTH = 1_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDocumentSet(value: unknown): SavedDocumentSetRecord | undefined {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.savedAt !== "string" || typeof value.clientCompany !== "string" || !Array.isArray(value.documents)) {
    return undefined;
  }
  const documents = value.documents.filter((document): document is Record<string, unknown> => isRecord(document) && typeof document.type === "string" && typeof document.html === "string" && document.html.length <= MAX_HTML_LENGTH);
  if (!documents.length || documents.length !== value.documents.length) return undefined;
  return {
    id: value.id,
    savedAt: value.savedAt,
    clientCompany: value.clientCompany,
    documents: documents.map((document) => ({ type: document.type as string, html: document.html as string })),
  };
}

export class LocalStorageDocumentSetRepository implements DocumentSetRepository {
  private readonly storage: Storage | undefined;

  public constructor(storage: Storage | undefined = typeof window === "undefined" ? undefined : window.localStorage) {
    this.storage = storage;
  }

  public list(): SavedDocumentSetRecord[] {
    if (!this.storage) return [];
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(STORAGE_KEY) ?? "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map(parseDocumentSet).filter((record): record is SavedDocumentSetRecord => record !== undefined).slice(0, MAX_DOCUMENT_SETS);
    } catch {
      return [];
    }
  }

  public save(documentSet: SavedDocumentSetRecord): void {
    if (!this.storage) return;
    const existing = this.list().filter((record) => record.id !== documentSet.id);
    this.storage.setItem(STORAGE_KEY, JSON.stringify([documentSet, ...existing].slice(0, MAX_DOCUMENT_SETS)));
  }

  public delete(id: string): void {
    if (!this.storage) return;
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.list().filter((record) => record.id !== id)));
  }
}
