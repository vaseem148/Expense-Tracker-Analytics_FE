import { useMemo } from 'react';
import { smoothPath } from './primitives';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  strokeWidth?: number;
}

/** Tiny inline trend. No axes, no labels - it exists to show shape only. */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = 'var(--s1)',
  fill = true,
  strokeWidth = 1.5,
}: Props) {
  const { line, area } = useMemo(() => {
    if (data.length < 2) return { line: '', area: '' };
    const max = Math.max(...data);
    const min = Math.min(...data);
    const span = max - min || 1;
    const pad = strokeWidth;
    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * (width - pad * 2) + pad,
      y: height - pad - ((v - min) / span) * (height - pad * 2),
    }));
    const path = smoothPath(points, 0.3);
    return {
      line: path,
      area: `${path} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`,
    };
  }, [data, width, height, strokeWidth]);

  if (!line) return <div style={{ width, height }} aria-hidden />;

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      {fill ? <path d={area} fill={color} opacity={0.13} /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
