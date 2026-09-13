import type { QuoteDraft, QuoteRepository } from "../../application/ports.ts";

export class InMemoryQuoteRepository implements QuoteRepository {
  private readonly quotes = new Map<string, QuoteDraft>();

  public async save(quote: QuoteDraft): Promise<void> {
    this.quotes.set(quote.id, quote);
  }

  public async getById(id: string, organizationId: string): Promise<QuoteDraft | undefined> {
    const quote = this.quotes.get(id);
    return quote?.organizationId === organizationId ? quote : undefined;
  }
}
