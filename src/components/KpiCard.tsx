import type { ReactNode } from "react";

export default function KpiCard({
  label,
  value,
  sublabel,
  icon,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  sublabel?: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        {icon && (
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              accent
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {value}
      </span>
      {sublabel && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{sublabel}</span>
      )}
    </div>
  );
}
