import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchSheetObjects } from "../src/lib/sheet";
import { normalizeRows } from "../src/lib/normalize";
import type { DashboardData } from "../src/lib/types";

async function main() {
  const raw = await fetchSheetObjects("Respuestas", { fresh: true });
  const mejoras = normalizeRows(raw);
  const data: DashboardData = {
    mejoras,
    updatedAt: new Date().toISOString(),
    rowCount: raw.length,
  };

  const outDir = path.resolve(__dirname, "..", "public");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "data.json"), JSON.stringify(data), "utf-8");
  console.log(`OK: ${mejoras.length} mejoras normalizadas de ${raw.length} filas fuente.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
