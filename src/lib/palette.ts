/**
 * Chart colour assignment.
 *
 * Series colours come from the validated eight-slot categorical order, assigned
 * by a stable key hash rather than by rank - so filtering a category out never
 * repaints the survivors. Beyond eight distinct entities the tail folds into
 * "Other" instead of inventing a ninth hue.
 */
export const SERIES_VARS = [
  'var(--s1)',
  'var(--s2)',
  'var(--s3)',
  'var(--s4)',
  'var(--s5)',
  'var(--s6)',
  'var(--s7)',
  'var(--s8)',
] as const;

export const SEQUENTIAL_VARS = [
  'var(--q1)',
  'var(--q2)',
  'var(--q3)',
  'var(--q4)',
  'var(--q5)',
  'var(--q6)',
  'var(--q7)',
] as const;

export const OTHER_COLOR = 'var(--ink-muted)';
export const MAX_SERIES = 8;

/** Deterministic slot for a stable entity key. */
export function seriesColor(index: number): string {
  return index >= MAX_SERIES ? OTHER_COLOR : SERIES_VARS[index];
}

/**
 * Ranks entities by value, keeps the top N and folds the rest into "Other".
 * Colour is bound to the entity key, so the same category keeps its hue across
 * every chart on the page.
 */
export function foldToPalette<T extends { name: string; total: number }>(
  items: T[],
  max = MAX_SERIES - 1,
): (T & { color: string; isOther?: boolean })[] {
  const sorted = [...items].sort((a, b) => b.total - a.total);
  const head = sorted.slice(0, max).map((item, i) => ({ ...item, color: SERIES_VARS[i] }));
  const tail = sorted.slice(max);
  if (!tail.length) return head;
  return [
    ...head,
    {
      ...tail[0],
      name: 'Other',
      total: tail.reduce((acc, t) => acc + t.total, 0),
      color: OTHER_COLOR,
      isOther: true,
    },
  ];
}

/** Bucket a 0-1 intensity onto the sequential ramp. */
export function sequentialStep(intensity: number): string {
  if (intensity <= 0) return 'var(--surface-2)';
  const index = Math.min(
    SEQUENTIAL_VARS.length - 1,
    Math.floor(intensity * SEQUENTIAL_VARS.length),
  );
  return SEQUENTIAL_VARS[index];
}

export const STATUS_COLOR = {
  good: 'var(--good)',
  warning: 'var(--warning)',
  serious: 'var(--serious)',
  critical: 'var(--critical)',
} as const;
