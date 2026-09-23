"use client";

type Props = {
  confidence: number;
};

export function ConfidenceArc({ confidence }: Props) {
  const c = Math.max(0, Math.min(100, confidence));
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (c / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <svg width="108" height="72" viewBox="0 0 108 72" aria-hidden>
        <path
          d="M12 60 A42 42 0 1 1 96 60"
          fill="none"
          stroke="#c8b48a"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M12 60 A42 42 0 1 1 96 60"
          fill="none"
          stroke="#1b1712"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
        <text
          x="54"
          y="54"
          textAnchor="middle"
          className="fill-[var(--ink)]"
          style={{ fontSize: "16px", fontWeight: 700 }}
        >
          {c}
        </text>
      </svg>
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
          Confidence
        </p>
        <p className="text-sm text-[var(--ink-soft)]">How sure the engine is, not how tasty it is.</p>
      </div>
    </div>
  );
}
