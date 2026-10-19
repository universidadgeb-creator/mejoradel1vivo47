import { isoWeekUTC, monthKey, monthLabel, parseSheetDate, weekKey, weekLabel } from "./date";
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

// Una fecha capturada más de 7 días después del envío, o más de ~6 meses antes, se considera error.
const MAX_FUTURE_DAYS = 7;
const MAX_PAST_DAYS = 180;

export function normalizeRows(raw: Record<string, string>[]): Mejora[] {
  const out: Mejora[] = [];
  raw.forEach((row, idx) => {
    const sucursal = (row["Sucursal"] || "").trim();
    if (!sucursal) return;
    const club = sucursalToClub(sucursal);
    // "Oficina Central" son pruebas internas, no cuentan como mejora de club.
    if (!club) return;

    const entered = parseSheetDate(row["Fecha de registro de la mejora"] || "");
    const submitted = parseSheetDate(row["Timestamp"] || "");
    let date = entered ?? submitted;
    let fechaAjustada = false;
    // La fecha la captura la persona y a veces trae errores de dedo (año 1998,
    // mes equivocado). Si queda muy lejos de cuando se envió el formulario,
    // se usa la fecha de envío.
    if (entered && submitted) {
      const diffDays = (entered.getTime() - submitted.getTime()) / 86400000;
      if (diffDays > MAX_FUTURE_DAYS || diffDays < -MAX_PAST_DAYS) {
        date = submitted;
        fechaAjustada = true;
      }
    }
    if (!date) return;

    // Año ISO de la semana (no el calendario): el 1-3 de enero puede ser semana 52/53 del año anterior.
    const iso = isoWeekUTC(date);
    const year = date.getUTCFullYear();

    const equipo = (row["Equipo (País)"] || "").trim();
    const nombre = (row["Nombre completo"] || row["Nombre completo "] || "").trim();

    out.push({
      id: idx,
      fecha: date.toISOString().slice(0, 10),
      year,
      week: iso.week,
      weekKey: weekKey(iso.year, iso.week),
      weekLabel: weekLabel(iso.year, iso.week),
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
      fechaAjustada,
      fechaOriginal: fechaAjustada ? (row["Fecha de registro de la mejora"] || "") : "",
    });
  });

  return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
}
