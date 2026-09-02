"use client";

import { useEffect } from "react";
import { CLUB_NAMES } from "@/lib/rosters";
import { MES_LABELS } from "@/lib/date";
import { formatDateEs, formatNumber } from "@/lib/format";
import type { CountryDetail } from "@/lib/stats";

const CLUB_BADGE: Record<string, string> = {
  NAC: "bg-sky-50 text-sky-700",
  GMT: "bg-orange-50 text-orange-700",
  VR: "bg-emerald-50 text-emerald-700",
};

export default function CountryDetailModal({
  detail,
  onClose,
  onYearChange,
}: {
  detail: CountryDetail;
  onClose: () => void;
  onYearChange: (year: number) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                {detail.pais}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CLUB_BADGE[detail.club]}`}
              >
                {CLUB_NAMES[detail.club]}
              </span>
            </div>
            {detail.area && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{detail.area}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total histórico" value={formatNumber(detail.totalAllTime)} />
          <Stat label={`Este ${detail.selectedYear}`} value={formatNumber(detail.totalYear)} />
          <Stat label="Racha actual" value={`${detail.currentStreak} sem.`} />
          <Stat label="Mejor racha" value={`${detail.bestStreak} sem.`} />
        </div>

        {detail.years.length > 1 && (
          <div className="mb-3 flex items-center gap-1">
            {detail.years.map((y) => (
              <button
                key={y}
                onClick={() => onYearChange(y)}
                className={`rounded-lg px-3 py-1 text-sm font-medium ${
                  y === detail.selectedYear
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        <div className="mb-5">
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            Calendario {detail.selectedYear} · una casilla por semana ISO. Verde = subió al menos
            una mejora.
          </p>
          <YearCalendar weeks={detail.calendarWeeks} />
        </div>

        <div>
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            Mejoras registradas en {detail.selectedYear} ({detail.entries.length}).
          </p>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-black/5 dark:border-white/10">
            {detail.entries.length === 0 ? (
              <p className="p-4 text-center text-sm text-neutral-400">Sin mejoras este año</p>
            ) : (
              <ul className="divide-y divide-black/5 dark:divide-white/5">
                {detail.entries.map((m) => (
                  <li key={m.id} className="p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {formatDateEs(m.fecha)} · {m.weekLabel}
                      </span>
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                        {m.nombre}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-800 dark:text-neutral-100">
                      {m.explicacion || m.oportunidad || "—"}
                    </p>
                    {(m.impacto || m.estado) && (
                      <p className="mt-1 text-xs text-neutral-400">
                        {[m.impacto, m.estado].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="text-lg font-bold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
}

function YearCalendar({
  weeks,
}: {
  weeks: { key: string; label: string; month: number; active: boolean }[];
}) {
  const cols = weeks.length;
  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(12px, 1fr))`, minWidth: cols * 14 }}
      >
        {weeks.map((w, i) => {
          const showMonth = i === 0 || weeks[i - 1].month !== w.month;
          return (
            <div
              key={w.key}
              className="text-center text-[9px] font-medium text-neutral-400"
              style={{ gridColumn: i + 1 }}
            >
              {showMonth ? MES_LABELS[w.month] : ""}
            </div>
          );
        })}
        {weeks.map((w, i) => (
          <div
            key={w.key}
            title={`${w.label} · ${w.active ? "activo" : "sin mejora"}`}
            className={`h-3.5 rounded-[3px] ${
              w.active ? "bg-emerald-500" : "bg-neutral-100 dark:bg-neutral-800"
            }`}
            style={{ gridColumn: i + 1 }}
          />
        ))}
      </div>
    </div>
  );
}
