import { formatPercent } from "@/lib/format";
import type { DashboardStats } from "@/lib/stats";

export default function ParticipationCards({
  participation,
}: {
  participation: DashboardStats["participation"];
}) {
  return (
    <div>
      <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
        Última semana completa: <span className="font-semibold">{participation.weekLabel}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {participation.clubs.map((c) => (
          <div
            key={c.club}
            className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                {c.nombre}
              </span>
              <span className="text-[11px] text-neutral-400">Meta semanal: {c.meta}</span>
            </div>
            <Metric label="Mejoras" value={`${c.mejoras} / ${c.meta}`} pct={c.mejoras / c.meta} />
            <Metric
              label="Países activos"
              value={`${c.paisesActivos} / ${c.paisesTotal}`}
              pct={c.paisesActivos / c.paisesTotal}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="font-semibold text-neutral-700 dark:text-neutral-200">
          {value} · {formatPercent(pct)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className={`h-full rounded-full ${pct >= 1 ? "bg-emerald-500" : pct >= 0.6 ? "bg-amber-500" : "bg-rose-500"}`}
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>
    </div>
  );
}
