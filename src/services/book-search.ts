import type {
  BookSearchResult,
  LibraryBookResult,
} from "@/domain/library";

export async function searchBooks(
  query: string,
): Promise<BookSearchResult[]> {
  const response = await fetch(`/api/books?keyword=${encodeURIComponent(query)}`);
  const payload = (await response.json()) as {
    books?: BookSearchResult[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "도서 검색에 실패했습니다.");
  }

  return payload.books ?? [];
}

export async function searchBookAvailability(
  isbn13: string,
): Promise<{ results: LibraryBookResult[]; failedCount: number }> {
  const response = await fetch(`/api/books?isbn13=${encodeURIComponent(isbn13)}`);
  const payload = (await response.json()) as {
    results?: LibraryBookResult[];
    failedCount?: number;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "도서관 대출 상태 조회에 실패했습니다.");
  }

  return {
    results: payload.results ?? [],
    failedCount: payload.failedCount ?? 0,
  };
}
