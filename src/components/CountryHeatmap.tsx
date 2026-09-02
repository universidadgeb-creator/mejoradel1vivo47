import type { CountryHeatmap as CountryHeatmapData } from "@/lib/stats";

export default function CountryHeatmap({ data }: { data: CountryHeatmapData }) {
  if (data.rows.length === 0) {
    return <p className="text-sm text-neutral-400">Sin datos para este filtro</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-y-1 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:bg-neutral-900">
              País
            </th>
            {data.weeks.map((w) => (
              <th
                key={w.key}
                className="px-1 py-1 text-center text-[10px] font-medium text-neutral-400"
                title={w.label}
              >
                {w.label.split(" ")[0]}
              </th>
            ))}
            <th className="px-2 py-1 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Activas
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={row.pais}>
              <td className="sticky left-0 z-10 bg-white px-2 py-1 dark:bg-neutral-900">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {row.pais}
                </div>
                {row.area && (
                  <div className="text-[11px] text-neutral-400">{row.area}</div>
                )}
              </td>
              {row.cells.map((active, i) => (
                <td key={data.weeks[i].key} className="px-1 py-1 text-center">
                  <span
                    title={`${row.pais} · ${data.weeks[i].label} · ${active ? "activo" : "sin mejora"}`}
                    className={`mx-auto block h-4 w-4 rounded-[4px] ${
                      active
                        ? "bg-emerald-500"
                        : "bg-neutral-100 dark:bg-neutral-800"
                    }`}
                  />
                </td>
              ))}
              <td className="px-2 py-1 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                {row.activeCount}/{data.weeks.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
