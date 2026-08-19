import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn('skeleton', className)} style={style} />;
}

export function SkeletonCard({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={cn('card p-5', height)}>
      <Skeleton className="h-4 w-40 mb-2" />
      <Skeleton className="h-3 w-24 mb-6" />
      <Skeleton className="h-[calc(100%-4.5rem)] w-full" />
    </div>
  );
}

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" style={{ opacity: 1 - i * 0.08 }} />
      ))}
    </div>
  );
}
