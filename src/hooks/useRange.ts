import { useCallback, useMemo, useState } from 'react';
import type { RangeParams } from '@/api/queries';

export type PresetKey = '30d' | '90d' | '6m' | '12m' | 'ytd' | 'mtd';

export interface Preset {
  key: PresetKey;
  label: string;
  granularity: RangeParams['granularity'];
  from: () => Date;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const PRESETS: Preset[] = [
  {
    key: 'mtd',
    label: 'This month',
    granularity: 'day',
    from: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  },
  {
    key: '30d',
    label: 'Last 30 days',
    granularity: 'day',
    from: () => new Date(startOfToday().getTime() - 29 * 864e5),
  },
  {
    key: '90d',
    label: 'Last 90 days',
    granularity: 'week',
    from: () => new Date(startOfToday().getTime() - 89 * 864e5),
  },
  {
    key: '6m',
    label: 'Last 6 months',
    granularity: 'month',
    from: () => new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
  },
  {
    key: '12m',
    label: 'Last 12 months',
    granularity: 'month',
    from: () => new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
  },
  {
    key: 'ytd',
    label: 'Year to date',
    granularity: 'month',
    from: () => new Date(new Date().getFullYear(), 0, 1),
  },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * One range for the whole page. Presets carry their own sensible granularity -
 * daily buckets over 12 months would be unreadable, monthly over 30 days would
 * be a single bar - but the user can still override it.
 */
export function useRange(initial: PresetKey = '12m') {
  const [preset, setPreset] = useState<PresetKey>(initial);
  const [granularity, setGranularity] = useState<RangeParams['granularity'] | null>(null);

  const active = PRESETS.find((p) => p.key === preset) ?? PRESETS[4];

  const range = useMemo<RangeParams>(
    () => ({
      from: iso(active.from()),
      to: iso(new Date()),
      granularity: granularity ?? active.granularity,
    }),
    [active, granularity],
  );

  const choosePreset = useCallback((key: PresetKey) => {
    setPreset(key);
    setGranularity(null);
  }, []);

  return { range, preset, choosePreset, granularity: range.granularity, setGranularity, active };
}
