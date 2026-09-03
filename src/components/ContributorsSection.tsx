"use client";

import { useMemo, useState } from "react";
import { CLUB_NAMES } from "@/lib/rosters";
import { formatDateEs } from "@/lib/format";
import type { ContributorRow, Contributor } from "@/lib/stats";

const CLUB_BADGE: Record<string, string> = {
  NAC: "bg-sky-50 text-sky-700",
  GMT: "bg-orange-50 text-orange-700",
  VR: "bg-emerald-50 text-emerald-700",
};

type SortKey = "total" | "nombre" | "sucursal" | "equipo" | "area" | "ultimaFecha";

export default function ContributorsSection({
  topContributors,
  rows,
}: {
  topContributors: Contributor[];
  rows: ContributorRow[];
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? rows.filter(
          (r) =>
            r.nombre.toLowerCase().includes(q) ||
            r.equipo.toLowerCase().includes(q) ||
            r.sucursal.toLowerCase().includes(q) ||
            (r.area ?? "").toLowerCase().includes(q)
        )
      : rows;
    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "total") return (a.total - b.total) * dir;
      return String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")) * dir;
    });
    return sorted;
  }, [rows, search, sortKey, sortDir]);

  const topBars = topContributors.slice(0, 8);
  const max = topBars[0]?.total ?? 1;

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900 lg:col-span-2">
        <h3 className="mb-1 text-sm font-bold text-neutral-800 dark:text-neutral-100">
          Representantes de equipo
        </h3>
        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          Personas con más mejoras registradas.
        </p>
        {topBars.length === 0 ? (
          <p className="text-sm text-neutral-400">Sin datos para este filtro</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {topBars.map((c, i) => (
              <li key={c.nombre} className="flex gap-3">
                <span className="w-4 shrink-0 pt-0.5 text-xs font-semibold text-neutral-400">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {c.nombre}
                    </span>
                    <span className="ml-auto shrink-0 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                      {c.total}
                    </span>
                  </div>
                  <div className="mb-1 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.max(4, (c.total / max) * 100)}%` }}
                    />
                  </div>
                  <p className="truncate text-[11px] text-neutral-400">
                    {c.teams
                      .map((t) => `${t.sucursal} · ${t.equipo}${t.area ? ` (${t.area})` : ""}`)
                      .join(", ")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900 lg:col-span-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              Quién sube las mejoras
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Desglose por sucursal, equipo (país), área y colaborador.
            </p>
          </div>
          <input
            type="search"
            placeholder="Buscar persona, equipo, área o sucursal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>
        <div className="max-h-80 overflow-auto rounded-xl border border-black/5 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              <tr>
                <Th label="Sucursal" active={sortKey === "sucursal"} dir={sortDir} onClick={() => toggleSort("sucursal")} />
                <Th label="Equipo (país)" active={sortKey === "equipo"} dir={sortDir} onClick={() => toggleSort("equipo")} />
                <Th label="Área" active={sortKey === "area"} dir={sortDir} onClick={() => toggleSort("area")} />
                <Th label="Colaborador" active={sortKey === "nombre"} dir={sortDir} onClick={() => toggleSort("nombre")} />
                <Th label="Mejoras" active={sortKey === "total"} dir={sortDir} onClick={() => toggleSort("total")} right />
                <Th
                  label="Última mejora"
                  active={sortKey === "ultimaFecha"}
                  dir={sortDir}
                  onClick={() => toggleSort("ultimaFecha")}
                />
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-neutral-400">
                    Sin resultados
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr
                    key={`${r.sucursal}-${r.equipo}-${r.nombre}`}
                    className="border-t border-black/5 dark:border-white/5"
                  >
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CLUB_BADGE[r.club]}`}
                      >
                        {CLUB_NAMES[r.club]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-neutral-700 dark:text-neutral-200">{r.equipo}</td>
                    <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                      {r.area ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-medium text-neutral-800 dark:text-neutral-100">
                      {r.nombre}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-neutral-800 dark:text-neutral-100">
                      {r.total}
                    </td>
                    <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                      {formatDateEs(r.ultimaFecha)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({
  label,
  active,
  dir,
  onClick,
  right,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  right?: boolean;
}) {
  return (
    <th
      onClick={onClick}
      className={`cursor-pointer select-none px-3 py-2 font-semibold hover:text-neutral-700 dark:hover:text-neutral-200 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {label}
      {active && <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );
}
