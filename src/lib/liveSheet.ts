import { SHEET_ID } from "./sheet";

interface GvizCell {
  v: unknown;
  f?: string;
}

export interface GvizTable {
  cols: { label: string }[];
  rows: { c: (GvizCell | null)[] }[];
}

interface GvizResponse {
  status: string;
  errors?: { message?: string; detailed_message?: string }[];
  table?: GvizTable;
}

/** Convierte la tabla de gviz al mismo formato de objetos que produce el CSV (valores ya formateados, como M/D/YYYY). */
export function gvizTableToObjects(table: GvizTable): Record<string, string>[] {
  const headers = table.cols.map((c) => (c.label ?? "").trim());
  return table.rows
    .map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        const cell = row.c[i];
        const value = cell?.f ?? (cell?.v == null ? "" : String(cell.v));
        obj[h] = value.trim();
      });
      return obj;
    })
    .filter((obj) => Object.values(obj).some((v) => v !== ""));
}

/**
 * Lee la hoja directo desde Google en el navegador. El CSV no trae CORS, pero el
 * endpoint gviz sí puede cargarse como <script> (JSONP) con responseHandler.
 */
export function fetchLiveRows(timeoutMs = 20000): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const cbName = `__gviz_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const w = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");

    const cleanup = () => {
      clearTimeout(timer);
      delete w[cbName];
      script.remove();
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Google Sheets tardó demasiado en responder"));
    }, timeoutMs);

    w[cbName] = (resp: GvizResponse) => {
      cleanup();
      if (resp.status !== "ok" || !resp.table) {
        const msg = resp.errors?.[0]?.detailed_message || resp.errors?.[0]?.message;
        reject(new Error(msg ?? "Google Sheets devolvió un error"));
        return;
      }
      resolve(gvizTableToObjects(resp.table));
    };
    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo conectar con Google Sheets"));
    };

    const params = new URLSearchParams({
      sheet: "Respuestas",
      headers: "1",
      _: String(Date.now()),
    });
    script.src =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${cbName}&` +
      params.toString();
    document.head.appendChild(script);
  });
}
