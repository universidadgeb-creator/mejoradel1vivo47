"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ClubTabs from "@/components/ClubTabs";
import FiltersBar from "@/components/FiltersBar";
import KpiCard from "@/components/KpiCard";
import TrendChart from "@/components/TrendChart";
import ClubBarChart from "@/components/ClubBarChart";
import ClubTrendChart from "@/components/ClubTrendChart";
import StreaksList from "@/components/StreaksList";
import TopCountries from "@/components/TopCountries";
import ParticipationCards from "@/components/ParticipationCards";
import ContributorsSection from "@/components/ContributorsSection";
import { BoltIcon, CalendarIcon, FlagIcon, TargetIcon, TrendIcon, TrophyIcon } from "@/components/icons";
import { applyFilters, computeStats } from "@/lib/stats";
import { CLUB_NAMES } from "@/lib/rosters";
import { formatDateEs, formatNumber, formatPercent, downloadCsv } from "@/lib/format";
import type { ClubCode, DashboardData, Filters } from "@/lib/types";

const EMPTY_FILTERS: Filters = {
  club: "ALL",
  desde: null,
  hasta: null,
  weekKey: null,
  monthKey: null,
  year: null,
};

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const load = useCallback(async (fresh: boolean) => {
    try {
      const res = await fetch(`/api/data${fresh ? "?fresh=1" : ""}`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al cargar datos");
      const json: DashboardData = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial al montar; load() solo actualiza estado tras el await del fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(false);
  }, [load]);

  function refresh() {
    setRefreshing(true);
    load(true);
  }

  const mejorasForTab = useMemo(() => {
    if (!data) return [];
    return filters.club === "ALL"
      ? data.mejoras
      : data.mejoras.filter((m) => m.club === filters.club);
  }, [data, filters.club]);

  const scoped = useMemo(() => {
    if (!data) return [];
    return applyFilters(data.mejoras, filters);
  }, [data, filters]);

  const stats = useMemo(() => {
    if (!data) return null;
    return computeStats(data.mejoras, scoped, filters);
  }, [data, scoped, filters]);

  function patchFilters(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch }));
  }

  function exportCsv() {
    downloadCsv(
      `mejora-1pct-${filters.club.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`,
      scoped.map((m) => ({
        Fecha: m.fecha,
        Semana: m.weekLabel,
        Sucursal: m.sucursal,
        "Equipo (País)": m.equipo,
        Colaborador: m.nombre,
        Oportunidad: m.oportunidad,
        Mejora: m.explicacion,
        Impacto: m.impacto,
        Estado: m.estado,
      }))
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f3] pb-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-neutral-500 shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Google Sheets · {data ? formatNumber(data.rowCount) : "…"} filas fuente
        </div>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Dashboard Mejora del 1%
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Seguimiento general de mejoras semanales Vivo 47
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200"
            >
              {refreshing ? "Actualizando…" : "↻ Refrescar"}
            </button>
            <button
              onClick={exportCsv}
              disabled={!data}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              ⬇ CSV
            </button>
          </div>
        </div>

        <div className="mb-6">
          <ClubTabs value={filters.club} onChange={(club: ClubCode | "ALL") => patchFilters({ club })} />
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
            Cargando datos del sheet…
          </div>
        ) : data && stats ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  {formatNumber(scoped.length)}
                </span>{" "}
                mejoras visibles de {formatNumber(data.mejoras.length)} normalizadas
              </span>
              <span>Actualizado: {new Date(data.updatedAt).toLocaleString("es-MX")}</span>
            </div>

            <div className="mb-6">
              <FiltersBar mejoras={mejorasForTab} filters={filters} onChange={patchFilters} />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <KpiCard label="Total YTD" value={formatNumber(stats.totalYTD)} sublabel={`Año ${new Date().getFullYear()}`} icon={<CalendarIcon />} />
              <KpiCard label="Mejoras este mes" value={formatNumber(stats.mejorasEsteMes)} sublabel="Mes actual" icon={<TrendIcon />} />
              <KpiCard
                label="Última semana"
                value={formatNumber(stats.ultimaSemana.count)}
                sublabel={`Meta ${stats.metaSemanal} · ${stats.ultimaSemana.weekLabel}`}
                icon={<BoltIcon />}
              />
              <KpiCard
                label="Cumplimiento semanal"
                value={formatPercent(stats.cumplimiento)}
                sublabel={`${stats.ultimaSemana.count} de ${stats.metaSemanal}`}
                icon={<TargetIcon />}
                accent
              />
              <KpiCard
                label={filters.club === "ALL" ? "Club líder" : "País líder"}
                value={stats.segmentLeader?.nombre ?? "—"}
                sublabel={stats.segmentLeader ? `${formatNumber(stats.segmentLeader.total)} mejoras` : undefined}
                icon={<TrophyIcon />}
              />
              <KpiCard
                label="Racha país líder"
                value={stats.rachaPaisLider?.pais ?? "—"}
                sublabel={
                  stats.rachaPaisLider
                    ? `${CLUB_NAMES[stats.rachaPaisLider.club]} · ${stats.rachaPaisLider.streak} semanas`
                    : undefined
                }
                icon={<FlagIcon />}
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Panel
                title={`Tendencia ${filters.club === "ALL" ? "Vivo 47" : CLUB_NAMES[filters.club]}`}
                subtitle={`Total contra meta semanal de ${stats.metaSemanal} mejoras.`}
                className="lg:col-span-2"
              >
                <TrendChart data={stats.weeklyTrend} />
              </Panel>
              <Panel
                title={filters.club === "ALL" ? "Mejoras por club" : "Mejoras por país"}
                subtitle="Participación acumulada."
              >
                <ClubBarChart data={stats.totalsBySegment} />
              </Panel>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Panel
                title={filters.club === "ALL" ? "Tendencia por club" : "Tendencia por país"}
                subtitle={
                  filters.club === "ALL"
                    ? "Una línea por club en las últimas semanas."
                    : "Una línea por país (top 5) en las últimas semanas."
                }
                className="lg:col-span-2"
              >
                <ClubTrendChart data={stats.weeklyBySegment} series={stats.segments} />
              </Panel>
              <Panel title="Top 5 rachas de países" subtitle="Semanas consecutivas subiendo al menos una mejora.">
                <StreaksList streaks={stats.topStreaks} />
              </Panel>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Panel title="Top países" subtitle="Países con más mejoras registradas.">
                <TopCountries countries={stats.topCountries} />
              </Panel>
              <Panel title="Participación por club" subtitle="">
                <ParticipationCards participation={stats.participation} />
              </Panel>
            </div>

            <div className="mb-6">
              <h2 className="mb-3 text-lg font-bold text-neutral-800 dark:text-neutral-100">
                Quién sube las mejoras
              </h2>
              <ContributorsSection topContributors={stats.topContributors} rows={stats.contributorRows} />
            </div>

            <footer className="pt-4 text-center text-xs text-neutral-400">
              Fuente:{" "}
              <a
                className="underline"
                href="https://docs.google.com/spreadsheets/d/17jANIWXZYQt6EY0p7VRpC1XeAzH-2ploBhebml-9XyU/edit"
                target="_blank"
                rel="noreferrer"
              >
                Sheet 1% Mejor
              </a>{" "}
              · última carga {formatDateEs(new Date().toISOString().slice(0, 10))}
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900 ${className}`}
    >
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
