import { CLUB_NAMES } from "@/lib/rosters";

const CLUB_BADGE: Record<string, string> = {
  NAC: "bg-sky-50 text-sky-700",
  GMT: "bg-orange-50 text-orange-700",
  VR: "bg-emerald-50 text-emerald-700",
};

export default function TopCountries({
  countries,
}: {
  countries: { club: string; pais: string; total: number }[];
}) {
  if (countries.length === 0) {
    return <p className="text-sm text-neutral-400">Sin datos para este filtro</p>;
  }
  const max = countries[0]?.total ?? 1;
  return (
    <ol className="flex flex-col gap-2">
      {countries.map((c, i) => (
        <li key={`${c.club}-${c.pais}`} className="flex items-center gap-3">
          <span className="w-4 shrink-0 text-xs font-semibold text-neutral-400">{i + 1}</span>
          <div className="flex w-40 shrink-0 flex-col">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {c.pais}
            </span>
            <span
              className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${CLUB_BADGE[c.club]}`}
            >
              {CLUB_NAMES[c.club as keyof typeof CLUB_NAMES]}
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.max(4, (c.total / max) * 100)}%` }}
              />
            </div>
            <span className="w-6 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              {c.total}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
