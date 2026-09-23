"use client";

type Props = {
  score: number;
  status: "safe" | "risky" | "contains" | "unknown";
};

const LABELS = [
  "monk mode",
  "rice cake energy",
  "probably fine",
  "read the label",
  "side-eye",
  "shared fryer zone",
  "soy sauce incoming",
  "do not kiss this food",
  "celiac boss fight",
  "walk away",
  "don't die",
];

export function DeathMeter({ score, status }: Props) {
  const clamped = Math.max(0, Math.min(10, Math.round(score)));
  const pct = (clamped / 10) * 100;
  const color =
    status === "safe"
      ? "var(--safe)"
      : status === "risky"
        ? "var(--risky)"
        : status === "contains"
          ? "var(--bad)"
          : "var(--unknown)";

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
            Color meter · likelihood of dying
          </p>
          <p className="font-[family-name:var(--font-display)] text-3xl leading-none">
            {clamped}
            <span className="text-lg text-[var(--ink-soft)]"> / 10</span>
          </p>
        </div>
        <p className="max-w-[14rem] text-right text-sm italic text-[var(--ink-soft)]">
          {LABELS[clamped]}
        </p>
      </div>

      <div className="relative h-7 ink-border bg-[var(--paper-deep)]">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700"
          style={{
            width: `${Math.max(pct, 4)}%`,
            background: `linear-gradient(90deg, #3c8f57, ${color})`,
          }}
        />
        <div className="absolute inset-0 flex justify-between px-1 text-[10px] leading-7 text-black/50">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="w-2 text-center">
              {i}
            </span>
          ))}
        </div>
        <div
          className="absolute top-[-7px] h-10 w-[3px] bg-[var(--ink)] transition-all duration-700"
          style={{ left: `calc(${pct}% - 1px)` }}
        />
      </div>
    </div>
  );
}
