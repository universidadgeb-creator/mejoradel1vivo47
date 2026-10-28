import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchSheetObjects } from "../src/lib/sheet";
import { normalizeRows } from "../src/lib/normalize";
import type { DashboardData } from "../src/lib/types";
import { checkSanity } from "./sanity";

const PUBLISHED_URL =
  process.env.PREVIOUS_DATA_URL ??
  "https://universidadgeb-creator.github.io/mejoradel1vivo47/data.json";

async function fetchPrevious(): Promise<DashboardData | null> {
  try {
    const res = await fetch(`${PUBLISHED_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as DashboardData;
  } catch {
    return null;
  }
}

async function main() {
  const raw = await fetchSheetObjects("Respuestas", { fresh: true });
  const mejoras = normalizeRows(raw);
  const data: DashboardData = {
    mejoras,
    updatedAt: new Date().toISOString(),
    rowCount: raw.length,
  };

  if (process.env.ALLOW_SHRINK === "true") {
    console.log("ALLOW_SHRINK activo: se omite la validación contra la versión publicada.");
  } else {
    const prev = await fetchPrevious();
    if (!prev) console.warn("No se pudo leer la versión publicada; se omite la comparación.");
    const problem = checkSanity(data, prev);
    if (problem) {
      console.error(
        `::error title=Datos del Sheet sospechosos::${problem}. ` +
          `Revisa que la hoja "Respuestas" no tenga un filtro activo (Datos > Quitar filtro). ` +
          `Se conserva la versión publicada. Si el cambio es intencional, corre el workflow con "allow_shrink".`
      );
      process.exit(1);
    }
  }

  const outDir = path.resolve(__dirname, "..", "public");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "data.json"), JSON.stringify(data), "utf-8");
  console.log(`OK: ${mejoras.length} mejoras normalizadas de ${raw.length} filas fuente.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
