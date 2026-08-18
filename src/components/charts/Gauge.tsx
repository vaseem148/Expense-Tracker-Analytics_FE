interface Props {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  thickness?: number;
}

/**
 * Radial progress for a single bounded figure (health score, budget consumed).
 * A 270-degree sweep rather than a full circle so "empty" and "full" are
 * visually distinct at a glance.
 */
export function Gauge({
  value,
  max = 100,
  size = 148,
  label,
  sublabel,
  color = 'var(--brand)',
  thickness = 10,
}: Props) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweep = 0.75; // 270 degrees
  const track = circumference * sweep;
  const progress = Math.min(1, Math.max(0, value / max)) * track;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[225deg]" role="img" aria-label={label}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${track} ${circumference}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.2,0.8,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="tabular text-[30px] font-semibold leading-none tracking-[-0.02em] text-[var(--ink)]">
            {Math.round(value)}
          </p>
          {sublabel ? (
            <p className="mt-1 text-[11.5px] text-[var(--ink-muted)]">{sublabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
