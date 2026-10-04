import type { LibraryBookResult } from "@/domain/library";
import { searchMockBooks } from "@/services/adapters/mock-book-search";

export async function searchBooks(
  query: string,
): Promise<LibraryBookResult[]> {
  // 화면은 이 서비스만 호출하며, 실제 API 어댑터로 교체할 때 화면 변경을 줄인다.
  return searchMockBooks(query);
}
