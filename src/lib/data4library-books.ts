import type {
  BookSearchResult,
  LibraryBookResult,
  LoanStatus,
} from "@/domain/library";

const DATA4LIBRARY_BASE_URL = "https://www.data4library.kr/api";
const BUSAN_REGION_CODE = "21";

interface BookSearchResponse {
  response?: {
    errCode?: string;
    error?: string;
    docs?: Array<{
      doc?: Data4LibraryBook;
    }>;
  };
}

interface LibrarySearchResponse {
  response?: {
    errCode?: string;
    error?: string;
    libs?: Array<{
      lib?: Data4LibraryLibrary;
    }>;
  };
}

interface BookAvailabilityResponse {
  response?: {
    errCode?: string;
    error?: string;
    result?: {
      hasBook?: string;
      loanAvailable?: string;
    };
  };
}

interface Data4LibraryBook {
  bookname?: string;
  authors?: string;
  publisher?: string;
  publication_year?: string;
  isbn13?: string;
  bookImageURL?: string;
  bookDtlUrl?: string;
}

interface Data4LibraryLibrary {
  libCode?: string;
  libName?: string;
  address?: string;
  tel?: string;
  homepage?: string;
  latitude?: string;
  longitude?: string;
}

export interface BookAvailabilityResult {
  results: LibraryBookResult[];
  failedCount: number;
}

function getAuthKey(): string {
  const authKey = process.env.DATA4LIBRARY_AUTH_KEY?.trim();

  if (!authKey) {
    throw new Error(
      "DATA4LIBRARY_AUTH_KEY 환경변수가 설정되지 않았습니다. .env.local에 인증키를 입력하세요.",
    );
  }

  return authKey;
}

function getApiError(response: {
  errCode?: string;
  error?: string;
}): string | null {
  if (response.errCode && response.errCode !== "0") {
    return response.error ?? "도서관정보나루 API가 오류를 반환했습니다.";
  }

  return null;
}

function createParams(authKey: string, values: Record<string, string>) {
  return new URLSearchParams({
    authKey,
    format: "json",
    ...values,
  });
}

function normalizeSearchText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

async function requestJson<T>(endpoint: string, params: URLSearchParams) {
  const response = await fetch(`${DATA4LIBRARY_BASE_URL}/${endpoint}?${params}`);

  if (!response.ok) {
    throw new Error(
      `도서관정보나루 API 요청에 실패했습니다. (HTTP ${response.status})`,
    );
  }

  return (await response.json()) as T;
}

export async function searchData4LibraryBooks(
  keyword: string,
): Promise<BookSearchResult[]> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return [];
  }

  const payload = await requestJson<BookSearchResponse>(
    "srchBooks",
    createParams(getAuthKey(), {
      keyword: normalizedKeyword,
      exactMatch: "true",
      pageNo: "1",
      pageSize: "10",
    }),
  );
  const apiResponse = payload.response;

  if (!apiResponse) {
    throw new Error("도서 검색 API 응답 형식을 확인할 수 없습니다.");
  }

  const error = getApiError(apiResponse);
  if (error) {
    throw new Error(error);
  }

  const searchText = normalizeSearchText(normalizedKeyword);

  return (apiResponse.docs ?? [])
    .map((item) => item.doc)
    .filter((book): book is Data4LibraryBook => Boolean(book?.isbn13))
    .map((book) => ({
      title: book.bookname ?? "제목 확인 필요",
      authors: book.authors ?? "저자 확인 필요",
      publisher: book.publisher ?? "출판사 확인 필요",
      publicationYear: book.publication_year ?? "연도 확인 필요",
      isbn13: book.isbn13!,
      imageUrl: book.bookImageURL,
      detailUrl: book.bookDtlUrl,
    }))
    .filter((book) => normalizeSearchText(book.title).includes(searchText));
}

function toLoanStatus(value: string | undefined): LoanStatus {
  if (value === "Y") {
    return "available";
  }

  if (value === "N") {
    return "borrowed";
  }

  return "unknown";
}

export async function findBookAvailability(
  isbn13: string,
): Promise<BookAvailabilityResult> {
  const normalizedIsbn = isbn13.replace(/[-\s]/g, "");

  if (!/^\d{13}$/.test(normalizedIsbn)) {
    throw new Error("ISBN-13은 숫자 13자리로 입력해야 합니다.");
  }

  const authKey = getAuthKey();
  const librariesPayload = await requestJson<LibrarySearchResponse>(
    "libSrchByBook",
    createParams(authKey, {
      isbn: normalizedIsbn,
      region: BUSAN_REGION_CODE,
      pageNo: "1",
      pageSize: "100",
    }),
  );
  const libraryResponse = librariesPayload.response;

  if (!libraryResponse) {
    throw new Error("소장 도서관 API 응답 형식을 확인할 수 없습니다.");
  }

  const libraryError = getApiError(libraryResponse);
  if (libraryError) {
    throw new Error(libraryError);
  }

  const libraries = (libraryResponse.libs ?? [])
    .map((item) => item.lib)
    .filter((library): library is Data4LibraryLibrary =>
      Boolean(library?.libCode && library.libName && library.address),
    );

  const results = await Promise.allSettled(
    libraries.map(async (library): Promise<LibraryBookResult> => {
      const availabilityPayload = await requestJson<BookAvailabilityResponse>(
        "bookExist",
        createParams(authKey, {
          libCode: library.libCode!,
          isbn13: normalizedIsbn,
        }),
      );
      const availabilityResponse = availabilityPayload.response;

      if (!availabilityResponse) {
        throw new Error("대출 상태 API 응답 형식을 확인할 수 없습니다.");
      }

      const availabilityError = getApiError(availabilityResponse);
      if (availabilityError) {
        throw new Error(availabilityError);
      }

      const availability = availabilityResponse.result;

      return {
        libraryId: library.libCode!,
        libraryName: library.libName!,
        address: library.address!,
        bookTitle: "",
        hasBook: availability?.hasBook === "Y",
        loanStatus: toLoanStatus(availability?.loanAvailable),
        latitude: library.latitude
          ? Number(library.latitude)
          : undefined,
        longitude: library.longitude
          ? Number(library.longitude)
          : undefined,
        dataUpdatedAt: new Date().toISOString(),
      };
    }),
  );

  return {
    results: results
      .filter(
        (result): result is PromiseFulfilledResult<LibraryBookResult> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value),
    failedCount: results.filter((result) => result.status === "rejected").length,
  };
}
