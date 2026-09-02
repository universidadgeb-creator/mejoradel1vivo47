"use client";

import { CLUB_CODES, CLUB_NAMES } from "@/lib/rosters";
import type { ClubCode } from "@/lib/types";

export default function ClubTabs({
  value,
  onChange,
}: {
  value: ClubCode | "ALL";
  onChange: (club: ClubCode | "ALL") => void;
}) {
  const tabs: { code: ClubCode | "ALL"; label: string }[] = [
    { code: "ALL", label: "Vivo 47" },
    ...CLUB_CODES.map((c) => ({ code: c, label: CLUB_NAMES[c] })),
  ];

  return (
    <div className="flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-sm border border-black/5 dark:bg-neutral-900 dark:border-white/10 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.code}
          onClick={() => onChange(tab.code)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            value === tab.code
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
