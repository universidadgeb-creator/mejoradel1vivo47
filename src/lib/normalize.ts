import { isoWeek, monthKey, monthLabel, parseSheetDate, weekKey, weekLabel } from "./date";
import type { ClubCode, Mejora } from "./types";

export function stripAccents(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

const SUCURSAL_TO_CLUB: Record<string, ClubCode | undefined> = {
  "NACIONES UNIDAS": "NAC",
  GOURMETERIA: "GMT",
  "VALLE REAL": "VR",
};

export function sucursalToClub(sucursal: string): ClubCode | null {
  return SUCURSAL_TO_CLUB[stripAccents(sucursal)] ?? null;
}

export function normalizeRows(raw: Record<string, string>[]): Mejora[] {
  const out: Mejora[] = [];
  raw.forEach((row, idx) => {
    const sucursal = (row["Sucursal"] || "").trim();
    if (!sucursal) return;
    const club = sucursalToClub(sucursal);
    // "Oficina Central" son pruebas internas, no cuentan como mejora de club.
    if (!club) return;

    const fechaRaw = row["Fecha de registro de la mejora"] || row["Timestamp"] || "";
    const date = parseSheetDate(fechaRaw);
    if (!date) return;

    const semanaCol = Number(row["Semana ISO"] || row["Semana"]);
    const computed = isoWeek(date);
    const week = Number.isFinite(semanaCol) && semanaCol > 0 ? semanaCol : computed.week;
    const year = date.getUTCFullYear();

    const equipo = (row["Equipo (País)"] || "").trim();
    const nombre = (row["Nombre completo"] || row["Nombre completo "] || "").trim();

    out.push({
      id: idx,
      fecha: date.toISOString().slice(0, 10),
      year,
      week,
      weekKey: weekKey(year, week),
      weekLabel: weekLabel(year, week),
      monthKey: monthKey(year, date.getUTCMonth()),
      monthLabel: monthLabel(year, date.getUTCMonth()),
      sucursal,
      club,
      equipo,
      equipoNorm: stripAccents(equipo),
      nombre: nombre || "Sin nombre",
      oportunidad: row["¿Qué oportunidad detectamos esta semana?"] || "",
      explicacion: row["Explica la mejora del 1% que se activó esta semana"] || "",
      impacto: row["¿En qué impacta principalmente esta mejora?"] || "",
      estado: row["Estado de la mejora"] || "",
    });
  });

  return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
}
