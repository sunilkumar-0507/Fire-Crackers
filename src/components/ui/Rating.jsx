import { memo, useId } from 'react';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';

/* One star, as a path, centred on (cx, 10) in a 20-unit cell. */
const starPath = (cx, outer = 9, inner = 4.1) => {
  let d = '';
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * r).toFixed(2)},${(10 + Math.sin(a) * r).toFixed(2)}`;
  }
  return `${d}Z`;
};

/* All five stars as a single path string, built once at module load. */
const FIVE_STARS = Array.from({ length: 5 }, (_, i) => starPath(10 + i * 20)).join('');

const HEIGHTS = { xs: 12, sm: 14, md: 16, lg: 20 };

/**
 * Five stars with true fractional fill (4.7 fills 70% of the fifth star).
 *
 * PERF: this used to render ten separate lucide `<Star>` icons — about 22 DOM
 * nodes and ten React elements per rating. On a 43-card catalogue page that is
 * ~950 nodes for decoration alone. It is now one `<svg>` with two paths and a
 * clip rect: six nodes, one element, identical output.
 */
export const Rating = memo(function Rating({
  value = 0,
  reviews,
  size = 'sm',
  showValue = true,
  className,
}) {
  const clipId = `r${useId().replace(/:/g, '')}`;
  const height = HEIGHTS[size] ?? HEIGHTS.sm;
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <svg
        viewBox="0 0 100 20"
        height={height}
        width={height * 5}
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={percent} height="20" />
          </clipPath>
        </defs>
        <path d={FIVE_STARS} className="fill-secondary-100 stroke-secondary-300" strokeWidth="1" />
        <path d={FIVE_STARS} className="fill-secondary-500" clipPath={`url(#${clipId})`} />
      </svg>

      {showValue ? (
        <span className="text-xs font-semibold text-ink">{value.toFixed(1)}</span>
      ) : null}
      {reviews != null ? (
        <span className="text-xs text-muted">({formatNumber(reviews)})</span>
      ) : null}
      <span className="sr-only">
        Rated {value} out of 5{reviews != null ? ` from ${formatNumber(reviews)} reviews` : ''}
      </span>
    </div>
  );
});

export default Rating;
