import { CLUB_NAMES } from "@/lib/rosters";
import type { CountryStreak } from "@/lib/stats";

const CLUB_BADGE: Record<string, string> = {
  NAC: "bg-sky-50 text-sky-700",
  GMT: "bg-orange-50 text-orange-700",
  VR: "bg-emerald-50 text-emerald-700",
};

export default function StreaksList({ streaks }: { streaks: CountryStreak[] }) {
  if (streaks.length === 0) {
    return <p className="text-sm text-neutral-400">Sin datos para este filtro</p>;
  }
  return (
    <ol className="flex flex-col gap-2">
      {streaks.map((s, i) => (
        <li
          key={`${s.club}-${s.pais}`}
          className="flex items-center gap-3 rounded-xl border border-black/5 p-3 dark:border-white/10"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
            {i + 1}
          </span>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {s.pais}
              {s.area && <span className="font-normal text-neutral-400"> · {s.area}</span>}
            </span>
            <span
              className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${CLUB_BADGE[s.club]}`}
            >
              {CLUB_NAMES[s.club]}
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-neutral-900 dark:text-white">{s.streak}</div>
            <div className="text-[10px] uppercase tracking-wide text-neutral-400">semanas</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
