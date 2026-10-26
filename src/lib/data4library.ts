import type { LibrarySummary } from "@/domain/library";

const DATA4LIBRARY_BASE_URL = "https://www.data4library.kr/api";
const BUSAN_REGION_CODE = "21";

interface Data4LibraryApiResponse {
  response?: {
    errCode?: string;
    message?: string;
    error?: string;
    numFound?: number | string;
    pageSize?: number | string;
    libs?: Array<{
      lib?: Data4LibraryLibrary;
    }>;
  };
}

interface Data4LibraryLibrary {
  libCode?: string;
  libName?: string;
  address?: string;
  tel?: string;
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

async function fetchLibraryPage(
  authKey: string,
  pageNo: number,
): Promise<NonNullable<Data4LibraryApiResponse["response"]>> {
  const params = new URLSearchParams({
    authKey,
    region: BUSAN_REGION_CODE,
    pageNo: String(pageNo),
    pageSize: "100",
    format: "json",
  });

  const response = await fetch(`${DATA4LIBRARY_BASE_URL}/libSrch?${params}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `도서관정보나루 API 요청에 실패했습니다. (HTTP ${response.status})`,
    );
  }

  const payload = (await response.json()) as Data4LibraryApiResponse;
  const apiResponse = payload.response;

  if (!apiResponse) {
    throw new Error("도서관정보나루 API 응답 형식을 확인할 수 없습니다.");
  }

  if (apiResponse.errCode && apiResponse.errCode !== "0") {
    throw new Error(
      apiResponse.error ??
        apiResponse.message ??
        "도서관정보나루 API가 오류를 반환했습니다.",
    );
  }

  return apiResponse;
}

export async function fetchBusanLibraries(): Promise<LibrarySummary[]> {
  const authKey = getAuthKey();
  const firstPage = await fetchLibraryPage(authKey, 1);
  const pageSize = Number(firstPage.pageSize) || 100;
  const totalLibraries = Number(firstPage.numFound);
  const totalPages = Number.isFinite(totalLibraries)
    ? Math.ceil(totalLibraries / pageSize)
    : 1;
  const pages = [firstPage];

  for (let pageNo = 2; pageNo <= totalPages; pageNo += 1) {
    pages.push(await fetchLibraryPage(authKey, pageNo));
  }

  const libraries = pages.flatMap((page) =>
    (page.libs ?? [])
      .map((item) => item.lib)
      .filter(
        (library): library is Data4LibraryLibrary => library !== undefined,
      ),
  );
  const uniqueLibraries = new Map(
    libraries
      .map(toLibrarySummary)
      .filter((library): library is LibrarySummary => library !== null)
      .map((library) => [library.libraryId, library]),
  );

  return [...uniqueLibraries.values()];
}
