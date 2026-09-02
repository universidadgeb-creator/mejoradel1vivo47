import { csvRowsToObjects, parseCsv } from "./csv";

export const SHEET_ID = "17jANIWXZYQt6EY0p7VRpC1XeAzH-2ploBhebml-9XyU";

function csvUrl(sheetName: string) {
  const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;
  return `${base}?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

export async function fetchSheetObjects(
  sheetName: string,
  opts: { fresh?: boolean } = {}
): Promise<Record<string, string>[]> {
  const res = await fetch(csvUrl(sheetName), {
    ...(opts.fresh
      ? { cache: "no-store" as const }
      : { next: { revalidate: 300 } }),
  });
  if (!res.ok) {
    throw new Error(
      `No se pudo leer la hoja "${sheetName}" (HTTP ${res.status})`
    );
  }
  const text = await res.text();
  return csvRowsToObjects(parseCsv(text));
}
