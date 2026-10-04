import type { LibraryBookResult } from "@/domain/library";

const mockResults: LibraryBookResult[] = [
  {
    libraryId: "busan-citizen",
    libraryName: "부산광역시립시민도서관",
    address: "부산광역시 부산진구 월드컵대로 462",
    bookTitle: "어린 왕자",
    hasBook: true,
    loanStatus: "available",
    distanceKm: 2.4,
    walkingMinutes: 31,
    transitMinutes: 18,
    latitude: 35.1732,
    longitude: 129.0553,
    dataUpdatedAt: "개발용 예시 데이터",
  },
  {
    libraryId: "busan-central",
    libraryName: "부산도서관",
    address: "부산광역시 사상구 사상로310번길 33",
    bookTitle: "어린 왕자",
    hasBook: true,
    loanStatus: "borrowed",
    distanceKm: 6.8,
    walkingMinutes: 84,
    transitMinutes: 36,
    latitude: 35.1781,
    longitude: 128.9898,
    dataUpdatedAt: "개발용 예시 데이터",
  },
  {
    libraryId: "busan-haeundae",
    libraryName: "부산광역시립해운대도서관",
    address: "부산광역시 해운대구 양운로 183",
    bookTitle: "어린 왕자",
    hasBook: true,
    loanStatus: "unknown",
    distanceKm: 10.2,
    walkingMinutes: 126,
    transitMinutes: 48,
    latitude: 35.1745,
    longitude: 129.1763,
    dataUpdatedAt: "개발용 예시 데이터",
  },
];

export async function searchMockBooks(
  query: string,
): Promise<LibraryBookResult[]> {
  // 앞뒤 공백과 대소문자 차이를 제거해 사용자의 입력을 안정적으로 비교한다.
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  // 인증키 발급 전에는 도서명 포함 여부로 개발용 결과를 필터링한다.
  return mockResults.filter((result) =>
    result.bookTitle.toLowerCase().includes(normalizedQuery),
  );
}
