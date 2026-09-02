import { NextRequest, NextResponse } from "next/server";
import { normalizeRows } from "@/lib/normalize";
import { fetchSheetObjects } from "@/lib/sheet";
import type { DashboardData } from "@/lib/types";

export async function GET(request: NextRequest) {
  const fresh = request.nextUrl.searchParams.get("fresh") === "1";

  try {
    const raw = await fetchSheetObjects("Respuestas", { fresh });
    const mejoras = normalizeRows(raw);
    const data: DashboardData = {
      mejoras,
      updatedAt: new Date().toISOString(),
      rowCount: raw.length,
    };
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=300" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 502 }
    );
  }
}
