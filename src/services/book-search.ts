import type { LibraryBookResult } from "@/domain/library";
import { searchMockBooks } from "@/services/adapters/mock-book-search";

export async function searchBooks(
  query: string,
): Promise<LibraryBookResult[]> {
  return searchMockBooks(query);
}
