import { CLUB_CODES, CLUB_NAMES, CLUB_ROSTERS } from "./rosters";
import { compareWeekKey, isoWeek, weekKey, weekLabel } from "./date";
import type { ClubCode, Filters, Mejora } from "./types";

export function applyFilters(mejoras: Mejora[], filters: Filters): Mejora[] {
  return mejoras.filter((m) => {
    if (filters.club !== "ALL" && m.club !== filters.club) return false;
    if (filters.desde && m.fecha < filters.desde) return false;
    if (filters.hasta && m.fecha > filters.hasta) return false;
    if (filters.weekKey && m.weekKey !== filters.weekKey) return false;
    if (filters.monthKey && m.monthKey !== filters.monthKey) return false;
    if (filters.year && m.year !== filters.year) return false;
    return true;
  });
}

function clubsInScope(club: ClubCode | "ALL"): ClubCode[] {
  return club === "ALL" ? CLUB_CODES : [club];
}

function metaFor(club: ClubCode | "ALL"): number {
  return clubsInScope(club).reduce((sum, c) => sum + CLUB_ROSTERS[c].length, 0);
}

function absWeek(key: string): number {
  const [y, w] = key.split("-").map(Number);
  return y * 100 + w;
}

interface WeekPoint {
  weekKey: string;
  weekLabel: string;
  total: number;
  meta: number;
}

export interface CountryStreak {
  club: ClubCode;
  pais: string;
  streak: number;
}

export interface Contributor {
  nombre: string;
  total: number;
  clubs: string[];
  equipos: string[];
  ultimaFecha: string;
}

export interface ContributorRow {
  sucursal: string;
  club: ClubCode;
  equipo: string;
  nombre: string;
  total: number;
  ultimaFecha: string;
}

export interface DashboardStats {
  totalYTD: number;
  mejorasEsteMes: number;
  ultimaSemana: { count: number; weekLabel: string };
  metaSemanal: number;
  cumplimiento: number;
  clubLider: { club: ClubCode; total: number } | null;
  segmentLeader: { nombre: string; total: number } | null;
  rachaPaisLider: CountryStreak | null;
  weeklyTrend: WeekPoint[];
  weeklyByClub: { weekKey: string; weekLabel: string; [club: string]: number | string }[];
  weeklyBySegment: { weekKey: string; weekLabel: string; [key: string]: number | string }[];
  segments: { key: string; label: string }[];
  totalsByClub: { club: ClubCode; nombre: string; total: number }[];
  totalsBySegment: { nombre: string; total: number }[];
  topCountries: { club: ClubCode; pais: string; total: number }[];
  topStreaks: CountryStreak[];
  participation: {
    weekLabel: string;
    clubs: {
      club: ClubCode;
      nombre: string;
      meta: number;
      mejoras: number;
      paisesActivos: number;
      paisesTotal: number;
    }[];
  };
  topContributors: Contributor[];
  contributorRows: ContributorRow[];
}

function longestConsecutiveStreak(weeksActive: Set<number>): number {
  let best = 0;
  for (const w of weeksActive) {
    if (weeksActive.has(w - 1)) continue; // no es el inicio de una racha
    let len = 1;
    let cur = w;
    while (weeksActive.has(cur + 1)) {
      cur += 1;
      len += 1;
    }
    best = Math.max(best, len);
  }
  return best;
}

export function computeStats(
  allMejoras: Mejora[],
  scoped: Mejora[],
  filters: Filters,
  now: Date = new Date()
): DashboardStats {
  const nowIso = isoWeek(now);
  const nowYear = now.getUTCFullYear();
  const currentWeekKey = weekKey(nowIso.year, nowIso.week);
  const clubs = clubsInScope(filters.club);

  // --- Semana completa más reciente (independiente de filtros de fecha) ---
  const scopedByClub = allMejoras.filter((m) => m.club && clubs.includes(m.club));
  const weeksAvailable = Array.from(new Set(scopedByClub.map((m) => m.weekKey))).sort(
    compareWeekKey
  );
  const pastWeeks = weeksAvailable.filter((w) => w < currentWeekKey);
  const lastCompleteWeekKey = pastWeeks.length
    ? pastWeeks[pastWeeks.length - 1]
    : weeksAvailable[weeksAvailable.length - 1] ?? currentWeekKey;
  const lastCompleteWeekLabel =
    scopedByClub.find((m) => m.weekKey === lastCompleteWeekKey)?.weekLabel ??
    weekLabel(nowIso.year, nowIso.week);

  // --- KPIs ---
  const totalYTD = scoped.filter((m) => m.year === nowYear).length;
  const currentMonthKey = `${nowYear}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const mejorasEsteMes = scoped.filter((m) => m.monthKey === currentMonthKey).length;
  const ultimaSemanaCount = scoped.filter((m) => m.weekKey === lastCompleteWeekKey).length;
  const metaSemanal = metaFor(filters.club);
  const cumplimiento = metaSemanal > 0 ? ultimaSemanaCount / metaSemanal : 0;

  const totalsByClubMap = new Map<ClubCode, number>();
  for (const c of clubs) totalsByClubMap.set(c, 0);
  for (const m of scoped) {
    if (!m.club) continue;
    totalsByClubMap.set(m.club, (totalsByClubMap.get(m.club) ?? 0) + 1);
  }
  const totalsByClub = clubs
    .map((c) => ({ club: c, nombre: CLUB_NAMES[c], total: totalsByClubMap.get(c) ?? 0 }))
    .sort((a, b) => b.total - a.total);
  const clubLider =
    filters.club === "ALL" && totalsByClub.length ? totalsByClub[0] : null;

  // --- Rachas por país ---
  const activeWeeksByCountry = new Map<string, Set<number>>();
  for (const m of scoped) {
    if (!m.club) continue;
    const key = `${m.club}::${m.equipoNorm}`;
    if (!activeWeeksByCountry.has(key)) activeWeeksByCountry.set(key, new Set());
    activeWeeksByCountry.get(key)!.add(absWeek(m.weekKey));
  }
  const streaks: CountryStreak[] = [];
  const displayPais = new Map<string, string>();
  for (const m of scoped) {
    const key = `${m.club}::${m.equipoNorm}`;
    if (!displayPais.has(key)) displayPais.set(key, m.equipo);
  }
  for (const [key, weeks] of activeWeeksByCountry.entries()) {
    const [club] = key.split("::") as [ClubCode];
    streaks.push({
      club,
      pais: displayPais.get(key) ?? key,
      streak: longestConsecutiveStreak(weeks),
    });
  }
  streaks.sort((a, b) => b.streak - a.streak);
  const topStreaks = streaks.slice(0, 5);
  const rachaPaisLider = streaks[0] ?? null;

  // --- Tendencia semanal ---
  const totalsByWeek = new Map<string, number>();
  for (const m of scoped) {
    totalsByWeek.set(m.weekKey, (totalsByWeek.get(m.weekKey) ?? 0) + 1);
  }
  const weeklyTrend: WeekPoint[] = Array.from(totalsByWeek.entries())
    .sort((a, b) => compareWeekKey(a[0], b[0]))
    .map(([wk, total]) => ({
      weekKey: wk,
      weekLabel: scoped.find((m) => m.weekKey === wk)?.weekLabel ?? wk,
      total,
      meta: metaSemanal,
    }));

  const weeklyByClubMap = new Map<string, { weekKey: string; weekLabel: string; [c: string]: number | string }>();
  for (const m of scoped) {
    if (!m.club) continue;
    if (!weeklyByClubMap.has(m.weekKey)) {
      weeklyByClubMap.set(m.weekKey, { weekKey: m.weekKey, weekLabel: m.weekLabel });
    }
    const entry = weeklyByClubMap.get(m.weekKey)!;
    entry[m.club] = ((entry[m.club] as number) ?? 0) + 1;
  }
  const weeklyByClub = Array.from(weeklyByClubMap.values()).sort((a, b) =>
    compareWeekKey(a.weekKey, b.weekKey)
  );

  // --- Top países ---
  const countryTotals = new Map<string, { club: ClubCode; pais: string; total: number }>();
  for (const m of scoped) {
    if (!m.club) continue;
    const key = `${m.club}::${m.equipoNorm}`;
    if (!countryTotals.has(key)) {
      countryTotals.set(key, { club: m.club, pais: m.equipo, total: 0 });
    }
    countryTotals.get(key)!.total += 1;
  }
  const topCountries = Array.from(countryTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const totalsBySegment: { nombre: string; total: number }[] =
    filters.club === "ALL"
      ? totalsByClub.map((c) => ({ nombre: c.nombre, total: c.total }))
      : Array.from(countryTotals.values())
          .sort((a, b) => b.total - a.total)
          .map((c) => ({ nombre: c.pais, total: c.total }));

  // --- Tendencia por segmento: por club (vista general) o por país (club único) ---
  let weeklyBySegment: { weekKey: string; weekLabel: string; [key: string]: number | string }[];
  let segments: { key: string; label: string }[];
  if (filters.club === "ALL") {
    weeklyBySegment = weeklyByClub;
    segments = clubs.map((c) => ({ key: c, label: CLUB_NAMES[c] }));
  } else {
    const top5 = topCountries.slice(0, 5);
    segments = top5.map((c) => ({ key: c.pais, label: c.pais }));
    const map = new Map<string, { weekKey: string; weekLabel: string; [k: string]: number | string }>();
    const top5Norm = new Set(top5.map((c) => c.pais));
    for (const m of scoped) {
      if (!top5Norm.has(m.equipo)) continue;
      if (!map.has(m.weekKey)) map.set(m.weekKey, { weekKey: m.weekKey, weekLabel: m.weekLabel });
      const entry = map.get(m.weekKey)!;
      entry[m.equipo] = ((entry[m.equipo] as number) ?? 0) + 1;
    }
    weeklyBySegment = Array.from(map.values()).sort((a, b) => compareWeekKey(a.weekKey, b.weekKey));
  }

  // --- Participación por club (última semana completa, snapshot global) ---
  const participationClubs = clubs.map((c) => {
    const roster = CLUB_ROSTERS[c];
    const weekRows = scopedByClub.filter(
      (m) => m.club === c && m.weekKey === lastCompleteWeekKey
    );
    const activeCountries = new Set(weekRows.map((m) => m.equipoNorm));
    const paisesActivos = roster.filter((p) => activeCountries.has(p)).length;
    return {
      club: c,
      nombre: CLUB_NAMES[c],
      meta: roster.length,
      mejoras: weekRows.length,
      paisesActivos,
      paisesTotal: roster.length,
    };
  });

  // --- Colaboradores (quién sube las mejoras) ---
  const contributorMap = new Map<string, Contributor>();
  const rowMap = new Map<string, ContributorRow>();
  for (const m of scoped) {
    if (!m.club) continue;
    const c = contributorMap.get(m.nombre) ?? {
      nombre: m.nombre,
      total: 0,
      clubs: [],
      equipos: [],
      ultimaFecha: m.fecha,
    };
    c.total += 1;
    if (!c.clubs.includes(m.sucursal)) c.clubs.push(m.sucursal);
    if (!c.equipos.includes(m.equipo)) c.equipos.push(m.equipo);
    if (m.fecha > c.ultimaFecha) c.ultimaFecha = m.fecha;
    contributorMap.set(m.nombre, c);

    const rowKey = `${m.sucursal}::${m.equipo}::${m.nombre}`;
    const row = rowMap.get(rowKey) ?? {
      sucursal: m.sucursal,
      club: m.club,
      equipo: m.equipo,
      nombre: m.nombre,
      total: 0,
      ultimaFecha: m.fecha,
    };
    row.total += 1;
    if (m.fecha > row.ultimaFecha) row.ultimaFecha = m.fecha;
    rowMap.set(rowKey, row);
  }
  const topContributors = Array.from(contributorMap.values()).sort(
    (a, b) => b.total - a.total
  );
  const contributorRows = Array.from(rowMap.values()).sort((a, b) => b.total - a.total);

  return {
    totalYTD,
    mejorasEsteMes,
    ultimaSemana: { count: ultimaSemanaCount, weekLabel: lastCompleteWeekLabel },
    metaSemanal,
    cumplimiento,
    clubLider,
    segmentLeader: totalsBySegment[0] ?? null,
    rachaPaisLider,
    weeklyTrend,
    weeklyByClub,
    weeklyBySegment,
    segments,
    totalsByClub,
    totalsBySegment,
    topCountries,
    topStreaks,
    participation: { weekLabel: lastCompleteWeekLabel, clubs: participationClubs },
    topContributors,
    contributorRows,
  };
}
