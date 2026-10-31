"use client";

import { FormEvent, useState } from "react";
import type {
  BookSearchResult,
  LibraryBookResult,
  LoanStatus,
} from "@/domain/library";
import {
  searchBookAvailability,
  searchBooks,
} from "@/services/book-search";

const statusLabels: Record<LoanStatus, string> = {
  available: "대출 가능",
  borrowed: "대출 중",
  unknown: "상태 확인 필요",
};

const statusStyles: Record<LoanStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  borrowed: "bg-amber-100 text-amber-800",
  unknown: "bg-slate-200 text-slate-700",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookSearchResult[]>([]);
  const [results, setResults] = useState<LibraryBookResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult>();
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [failedCount, setFailedCount] = useState(0);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSearched(true);
    setErrorMessage(undefined);
    setBooks([]);
    setResults([]);
    setSelectedBook(undefined);
    setSelectedLibraryId(undefined);
    setIsLoading(true);

    try {
      setBooks(await searchBooks(query));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "도서 검색에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBookSelect(book: BookSearchResult) {
    setSelectedBook(book);
    setSelectedLibraryId(undefined);
    setErrorMessage(undefined);
    setFailedCount(0);
    setIsAvailabilityLoading(true);

    try {
      const availability = await searchBookAvailability(book.isbn13);
      setResults(
        availability.results.map((result) => ({
          ...result,
          bookTitle: book.title,
        })),
      );
      setFailedCount(availability.failedCount);
    } catch (error) {
      setResults([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "도서관 대출 상태 조회에 실패했습니다.",
      );
    } finally {
      setIsAvailabilityLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-10">
          <p className="mb-3 text-sm font-bold tracking-[0.2em] text-blue-700">
            BOOKSMAP
          </p>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            부산 공공도서관의 책을
            <br />
            한 번에 찾아보세요.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            원하는 도서명을 검색하고, 대출 상태와 도서관 위치를 비교해 보세요.
          </p>
        </header>

        <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="book-search">
              도서명 검색
            </label>
            <input
              id="book-search"
              className="h-14 flex-1 rounded-2xl border border-slate-300 px-5 text-base outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="찾고 싶은 도서명을 입력하세요"
            />
            <button
              className="h-14 rounded-2xl bg-blue-700 px-8 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="submit"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? "검색 중..." : "도서 검색"}
            </button>
          </form>
          <p className="mt-3 text-sm text-slate-500">
            도서관정보나루 API에서 부산 지역 도서와 도서관별 대출 상태를 조회합니다.
          </p>
        </section>

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">검색 결과</p>
                <h2 className="mt-1 text-xl font-bold">
                  {selectedBook
                    ? `${results.length}곳의 도서관`
                    : hasSearched
                      ? `${books.length}권의 도서`
                      : "도서를 찾아보세요"}
                </h2>
              </div>
              {(books.length > 0 || results.length > 0) && (
                <span className="text-sm text-slate-500">
                  총 {selectedBook ? results.length : books.length}건
                </span>
              )}
            </div>

            {selectedBook && (
              <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-blue-50 p-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700">선택한 도서</p>
                  <p className="mt-1 font-bold">{selectedBook.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    ISBN {selectedBook.isbn13}
                  </p>
                </div>
                <button
                  className="shrink-0 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  onClick={() => {
                    setSelectedBook(undefined);
                    setResults([]);
                    setSelectedLibraryId(undefined);
                    setFailedCount(0);
                    setErrorMessage(undefined);
                  }}
                  type="button"
                >
                  도서 다시 선택
                </button>
              </div>
            )}

            {errorMessage && (
              <div
                aria-live="polite"
                className="mb-4 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {errorMessage}
              </div>
            )}
            {!hasSearched && (
              <EmptyState message="도서명을 입력하면 검색 결과가 표시됩니다." />
            )}
            {hasSearched && !selectedBook && books.length === 0 && !errorMessage && (
              <EmptyState message="검색 결과가 없습니다. 다른 도서명을 입력해 보세요." />
            )}
            <div className="space-y-3">
              {!selectedBook &&
                books.map((book) => (
                  <button
                    className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-slate-50"
                    key={book.isbn13}
                    onClick={() => handleBookSelect(book)}
                    type="button"
                  >
                    <h3 className="font-bold">{book.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{book.authors}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {book.publisher} · {book.publicationYear} · ISBN {book.isbn13}
                    </p>
                  </button>
                ))}
              {selectedBook && isAvailabilityLoading && (
                <EmptyState message="도서관별 대출 상태를 확인하는 중입니다." />
              )}
              {selectedBook && !isAvailabilityLoading && results.length === 0 && !errorMessage && (
                <EmptyState message="이 도서를 소장한 부산 지역 도서관이 없습니다." />
              )}
              {selectedBook && failedCount > 0 && (
                <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                  {failedCount}곳의 도서관 상태를 확인하지 못했습니다. 확인된 결과를 먼저 표시합니다.
                </p>
              )}
              {selectedBook &&
                results.map((result) => (
                <button
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedLibraryId === result.libraryId
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                  key={result.libraryId}
                  onClick={() => setSelectedLibraryId(result.libraryId)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold">{result.libraryName}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[result.loanStatus]}`}
                    >
                      {statusLabels[result.loanStatus]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{result.address}</p>
                </button>
                ))}
            </div>
          </div>

          <div
            aria-label="도서관 위치 지도 예시 영역"
            className="relative min-h-[420px] overflow-hidden rounded-3xl bg-[#dcebf0] shadow-sm ring-1 ring-slate-200"
          >
            <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(30deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(150deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(30deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(150deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff)] [background-position:0_0,0_0,20px_35px,20px_35px] [background-size:40px_70px]"></div>
            <div className="absolute left-6 top-6 rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-sm font-bold">지도 영역</p>
              <p className="mt-1 text-xs text-slate-500">카카오맵 연동 예정</p>
            </div>
            {results.map((result, index) => (
              <button
                aria-label={`${result.libraryName} 지도에서 선택`}
                className={`absolute flex h-10 w-10 items-center justify-center rounded-full border-4 border-white font-bold text-white shadow-lg transition ${
                  selectedLibraryId === result.libraryId
                    ? "z-10 scale-125 bg-blue-700"
                    : "bg-slate-700 hover:scale-110"
                }`}
                key={result.libraryId}
                onClick={() => setSelectedLibraryId(result.libraryId)}
                style={{
                  left: `${24 + index * 25}%`,
                  top: `${42 + (index % 2) * 18}%`,
                }}
                type="button"
              >
                {index + 1}
              </button>
            ))}
            {results.length === 0 && (
              <p className="absolute inset-x-8 top-1/2 text-center text-sm text-slate-600">
                검색 결과가 있으면 도서관 위치가 여기에 표시됩니다.
              </p>
            )}
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/90 p-4 text-sm shadow-sm backdrop-blur">
              <p className="font-bold">출발지 설정</p>
              <p className="mt-1 text-slate-600">
                위치 권한을 허용하거나 주소를 입력하면 이동 정보를 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mb-3 rounded-2xl bg-slate-50 p-8 text-center text-sm leading-6 text-slate-500">
      {message}
    </div>
  );
}
