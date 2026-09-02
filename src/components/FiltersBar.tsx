"use client";

import { useMemo } from "react";
import { compareWeekKey } from "@/lib/date";
import type { Filters, Mejora } from "@/lib/types";

export default function FiltersBar({
  mejoras,
  filters,
  onChange,
}: {
  mejoras: Mejora[];
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  const weeks = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mejoras) map.set(m.weekKey, m.weekLabel);
    return Array.from(map.entries()).sort((a, b) => compareWeekKey(b[0], a[0]));
  }, [mejoras]);

  const months = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mejoras) map.set(m.monthKey, m.monthLabel);
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [mejoras]);

  const years = useMemo(() => {
    return Array.from(new Set(mejoras.map((m) => m.year))).sort((a, b) => b - a);
  }, [mejoras]);

  const inputClass =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm outline-none focus:border-emerald-500 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <Field label="Desde">
        <input
          type="date"
          className={inputClass}
          value={filters.desde ?? ""}
          onChange={(e) => onChange({ desde: e.target.value || null })}
        />
      </Field>
      <Field label="Hasta">
        <input
          type="date"
          className={inputClass}
          value={filters.hasta ?? ""}
          onChange={(e) => onChange({ hasta: e.target.value || null })}
        />
      </Field>
      <Field label="Semana">
        <select
          className={inputClass}
          value={filters.weekKey ?? ""}
          onChange={(e) => onChange({ weekKey: e.target.value || null })}
        >
          <option value="">Todos</option>
          {weeks.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Mes">
        <select
          className={inputClass}
          value={filters.monthKey ?? ""}
          onChange={(e) => onChange({ monthKey: e.target.value || null })}
        >
          <option value="">Todos</option>
          {months.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Año">
        <select
          className={inputClass}
          value={filters.year ?? ""}
          onChange={(e) => onChange({ year: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Todos</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </Field>
      <button
        onClick={() =>
          onChange({ desde: null, hasta: null, weekKey: null, monthKey: null, year: null })
        }
        className="rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Limpiar
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}
