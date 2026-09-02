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
