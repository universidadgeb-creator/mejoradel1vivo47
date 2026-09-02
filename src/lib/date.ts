export const MES_LABELS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** Devuelve { year, week } ISO-8601 para una fecha dada (UTC, sin horas). */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function weekKey(year: number, week: number): string {
  return `${year}-${pad2(week)}`;
}

export function weekLabel(year: number, week: number): string {
  return `S${pad2(week)} ${year}`;
}

export function monthKey(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}`;
}

export function monthLabel(year: number, month0: number): string {
  return `${MES_LABELS[month0]} ${year}`;
}

/** Parsea fechas en formato M/D/YYYY (el que exporta Google Sheets). */
export function parseSheetDate(value: string): Date | null {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Compara dos claves de semana `YYYY-WW` cronológicamente. */
export function compareWeekKey(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Igual que isoWeek(), pero lee el día/mes/año en UTC en vez de zona local.
 * Necesario para fechas ya ancladas en UTC (p. ej. las que arma mondayOfIsoWeek):
 * leerlas con getters locales las corre un día en timezones negativos. */
export function isoWeekUTC(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function mondayOfIsoWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // lunes=1 ... domingo=7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return target;
}

/** Desplaza una semana ISO `deltaWeeks` semanas (puede ser negativo), cruzando años correctamente. */
export function shiftWeek(
  year: number,
  week: number,
  deltaWeeks: number
): { year: number; week: number } {
  const monday = mondayOfIsoWeek(year, week);
  monday.setUTCDate(monday.getUTCDate() + deltaWeeks * 7);
  return isoWeekUTC(monday);
}
