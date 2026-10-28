import type { DashboardData } from "../src/lib/types";

const MAX_DROP = 0.1; // se tolera borrar hasta 10% de filas entre corridas
const MIN_CLUB_ROWS = 20; // un club con pocas filas no se valida por separado
const MIN_CLUB_RATIO = 0.5;

function countByClub(d: Pick<DashboardData, "mejoras">): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of d.mejoras) out[m.sucursal] = (out[m.sucursal] ?? 0) + 1;
  return out;
}

/**
 * Compara lo recién leído del Sheet contra lo último publicado. Las respuestas del
 * formulario solo se agregan, así que una caída fuerte casi siempre significa que
 * alguien dejó un filtro activo en la hoja (el export respeta los filtros).
 * Devuelve el motivo del rechazo, o null si los datos se ven sanos.
 */
export function checkSanity(
  next: Pick<DashboardData, "mejoras" | "rowCount">,
  prev: Pick<DashboardData, "mejoras" | "rowCount"> | null
): string | null {
  if (next.mejoras.length === 0) return "el Sheet no devolvió ninguna mejora válida";
  if (!prev || prev.rowCount === 0) return null;

  if (next.rowCount < prev.rowCount * (1 - MAX_DROP)) {
    return `el Sheet devolvió ${next.rowCount} filas y la versión publicada tiene ${prev.rowCount}`;
  }

  const before = countByClub(prev);
  const after = countByClub(next);
  for (const [club, n] of Object.entries(before)) {
    if (n >= MIN_CLUB_ROWS && (after[club] ?? 0) < n * MIN_CLUB_RATIO) {
      return `${club} pasó de ${n} a ${after[club] ?? 0} mejoras`;
    }
  }
  return null;
}
