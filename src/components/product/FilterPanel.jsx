import { cn } from '@/utils/cn';
import { categoriesWithCounts, allTags, priceBounds, products } from '@/data';
import { AVAILABILITY_FILTERS } from '@/utils/search';
import { formatPrice } from '@/utils/format';
import Chip from '@/components/ui/Chip';

const TAG_LABELS = {
  silent: 'Silent',
  'kids-safe': 'Kids safe',
  classic: 'Classic',
  premium: 'Premium',
  value: 'Best value',
  colourful: 'Colourful',
  'photo-friendly': 'Photo friendly',
  loud: 'Loud',
  bulk: 'Bulk pack',
  gift: 'Gift ready',
  crackle: 'Crackle',
  'multi-shot': 'Multi-shot',
  garland: 'Garland',
  novelty: 'Novelty',
  wedding: 'Wedding',
  indoor: 'Indoor safe',
  daytime: 'Daytime',
  limited: 'Limited stock',
  heritage: 'Heritage',
  terrace: 'Terrace friendly',
};

const Group = ({ title, children, action }) => (
  <div className="border-b border-line pb-6 last:border-0 last:pb-0">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-2xs font-semibold uppercase tracking-[.18em] text-dark">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

/**
 * Catalogue filters.
 *
 * Fully controlled — every value comes from the URL and every change is pushed
 * back to it, so a filtered view is shareable and the back button behaves.
 */
export const FilterPanel = ({ filters, onChange, onReset, resultCount, className }) => {
  const toggleTag = (tag) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ tags: next });
  };

  const activeCount =
    (filters.category !== 'all' ? 1 : 0) +
    filters.tags.length +
    (filters.maxPrice != null ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-dark">
          Filters
          {activeCount > 0 ? (
            <span className="ml-2 rounded-full bg-flame px-2 py-0.5 text-2xs font-bold text-dark">
              {activeCount}
            </span>
          ) : null}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="text-2xs font-semibold text-primary underline underline-offset-4 hover:text-primary-700"
          >
            Reset all
          </button>
        ) : null}
      </div>

      <Group title="Category">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onChange({ category: 'all' })}
            className={cn(
              'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
              filters.category === 'all'
                ? 'bg-secondary-50 font-semibold text-primary'
                : 'text-ink hover:bg-secondary-50/60',
            )}
          >
            All categories
            <span className="text-2xs text-muted">
              {categoriesWithCounts.reduce((n, c) => n + c.productCount, 0)}
            </span>
          </button>

          {categoriesWithCounts.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange({ category: category.slug })}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
                filters.category === category.slug
                  ? 'bg-secondary-50 font-semibold text-primary'
                  : 'text-ink hover:bg-secondary-50/60',
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: category.accent }}
                />
                {category.name}
              </span>
              <span className="text-2xs text-muted">{category.productCount}</span>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Max price">
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={50}
          value={filters.maxPrice ?? priceBounds.max}
          onChange={(e) => {
            const value = Number(e.target.value);
            onChange({ maxPrice: value >= priceBounds.max ? null : value });
          }}
          aria-label="Maximum price"
          className="box-content h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary-100 bg-clip-content py-[9px] accent-primary"
        />
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted">{formatPrice(priceBounds.min)}</span>
          <span className="font-semibold text-primary">
            up to {formatPrice(filters.maxPrice ?? priceBounds.max)}
          </span>
        </div>
      </Group>

      <Group title="Type">
        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 14).map(({ tag, count }) => (
            <Chip
              key={tag}
              active={filters.tags.includes(tag)}
              onClick={() => toggleTag(tag)}
              count={count}
              className="!px-3 !py-1.5 !text-xs"
            >
              {TAG_LABELS[tag] ?? tag}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Availability">
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_FILTERS.map((option) => (
            <Chip
              key={option.value}
              active={filters.availability === option.value}
              onClick={() => onChange({ availability: option.value })}
              className="!px-3 !py-1.5 !text-xs"
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </Group>

      <p className="rounded-2xl bg-secondary-50/70 px-4 py-3 text-center text-xs text-muted">
        Showing <strong className="font-semibold text-primary">{resultCount}</strong> of{' '}
        {products.length} products
      </p>
    </div>
  );
};

export default FilterPanel;
