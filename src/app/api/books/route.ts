import { NextRequest, NextResponse } from "next/server";
import {
  findBookAvailability,
  searchData4LibraryBooks,
} from "@/lib/data4library-books";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword")?.trim();
  const isbn13 = request.nextUrl.searchParams.get("isbn13")?.trim();

  try {
    if (isbn13) {
      const availability = await findBookAvailability(isbn13);

      return NextResponse.json({
        isbn13,
        results: availability.results,
        count: availability.results.length,
        failedCount: availability.failedCount,
        dataUpdatedAt: new Date().toISOString(),
      });
    }

    if (!keyword) {
      return NextResponse.json(
        { error: "keyword 또는 isbn13 파라미터가 필요합니다." },
        { status: 400 },
      );
    }

    const books = await searchData4LibraryBooks(keyword);

    return NextResponse.json({
      keyword,
      books,
      count: books.length,
      dataUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "도서관정보나루 도서 API를 확인하는 중 오류가 발생했습니다.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
