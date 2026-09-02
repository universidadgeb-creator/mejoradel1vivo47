function base(children: React.ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const CalendarIcon = () =>
  base(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  );

export const TargetIcon = () =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  );

export const TrophyIcon = () =>
  base(
    <>
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h3a3 3 0 0 1-3 4M7 5H4a3 3 0 0 0 3 4" />
    </>
  );

export const FlagIcon = () =>
  base(
    <>
      <path d="M4 3v18" />
      <path d="M4 4h13l-2 4 2 4H4" />
    </>
  );

export const TrendIcon = () =>
  base(
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  );

export const BoltIcon = () => base(<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />);
