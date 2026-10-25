import { NextResponse } from "next/server";
import { fetchBusanLibraries } from "@/lib/data4library";

export async function GET() {
  try {
    const libraries = await fetchBusanLibraries();

    return NextResponse.json({
      libraries,
      count: libraries.length,
      dataUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "도서관정보나루 API를 확인하는 중 오류가 발생했습니다.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
