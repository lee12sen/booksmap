const DATA4LIBRARY_BASE_URL = "https://www.data4library.kr/api";
const BUSAN_REGION_CODE = "26";

interface Data4LibraryApiResponse {
  response?: {
    libs?: {
      lib?: Data4LibraryLibrary[];
    };
  };
  error?: {
    code?: string;
    message?: string;
  };
}

interface Data4LibraryLibrary {
  libCode?: string;
  libName?: string;
  address?: string;
  tel?: string;
  homepage?: string;
}

export interface LibrarySummary {
  libraryId: string;
  libraryName: string;
  address: string;
  telephone?: string;
  homepage?: string;
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

function toLibrarySummary(library: Data4LibraryLibrary): LibrarySummary | null {
  if (!library.libCode || !library.libName || !library.address) {
    return null;
  }

  return {
    libraryId: library.libCode,
    libraryName: library.libName,
    address: library.address,
    telephone: library.tel,
    homepage: library.homepage,
  };
}

export async function fetchBusanLibraries(): Promise<LibrarySummary[]> {
  const params = new URLSearchParams({
    authKey: getAuthKey(),
    region: BUSAN_REGION_CODE,
    pageNo: "1",
    pageSize: "100",
    format: "json",
  });

  const response = await fetch(`${DATA4LIBRARY_BASE_URL}/libSrch?${params}`, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `도서관정보나루 API 요청에 실패했습니다. (HTTP ${response.status})`,
    );
  }

  const payload = (await response.json()) as Data4LibraryApiResponse;
  const libraries = payload.response?.libs?.lib ?? [];
  const results = libraries
    .map(toLibrarySummary)
    .filter((library): library is LibrarySummary => library !== null);

  if (results.length === 0 && payload.error) {
    throw new Error(
      payload.error.message ?? "도서관정보나루 API가 오류를 반환했습니다.",
    );
  }

  return results;
}
