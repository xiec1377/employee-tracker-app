type StatPillProps = {
  label: string;
  value: number;
  accent?: string;
};

export function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div className="flex flex-col items-start rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">{value}</span>
      {accent && (
        <span
          className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${accent}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
