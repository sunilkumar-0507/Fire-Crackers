import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { filterProducts, SORT_OPTIONS } from '@/utils/search';
import { QUICK_FILTERS } from '@/constants';
import { backdrop, drawerRight } from '@/animations/variants';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import PageHeader from '@/components/ui/PageHeader';
import FilterPanel from '@/components/product/FilterPanel';
import ProductGrid from '@/components/product/ProductGrid';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

/**
 * Catalogue.
 *
 * All filter state lives in the URL, which makes every view shareable and
 * bookmarkable and lets the browser's back button undo a filter — behaviour
 * people expect from a shop and rarely get.
 */
export const Products = () => {
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useLockBodyScroll(drawerOpen);

  const filters = useMemo(
    () => ({
      query: params.get('q') ?? '',
      category: params.get('category') ?? 'all',
      tags: params.getAll('tag'),
      maxPrice: params.get('max') ? Number(params.get('max')) : null,
      minRating: params.get('rating') ? Number(params.get('rating')) : 0,
      inStockOnly: params.get('stock') === '1',
      sort: params.get('sort') ?? 'relevance',
    }),
    [params],
  );

  // Deferring keeps the range slider and chips responsive while a 43-item
  // grid re-renders behind them.
  const deferredFilters = useDeferredValue(filters);
  const stale = filters !== deferredFilters;

  const results = useMemo(() => filterProducts(deferredFilters), [deferredFilters]);

  const update = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);

      Object.entries(patch).forEach(([key, value]) => {
        const paramKey =
          { query: 'q', maxPrice: 'max', minRating: 'rating', inStockOnly: 'stock' }[key] ?? key;

        if (key === 'tags') {
          next.delete('tag');
          value.forEach((tag) => next.append('tag', tag));
          return;
        }
        if (
          value == null ||
          value === '' ||
          value === 'all' ||
          value === 0 ||
          value === false ||
          (key === 'sort' && value === 'relevance')
        ) {
          next.delete(paramKey);
          return;
        }
        next.set(paramKey, key === 'inStockOnly' ? '1' : String(value));
      });

      setParams(next, { replace: true, preventScrollReset: true });
    },
    [params, setParams],
  );

  const reset = useCallback(() => {
    const next = new URLSearchParams();
    if (filters.query) next.set('q', filters.query);
    setParams(next, { replace: true, preventScrollReset: true });
  }, [filters.query, setParams]);

  const activeQuickFilter = (quick) =>
    quick.tag ? filters.tags.includes(quick.tag) : filters.maxPrice === quick.maxPrice;

  const toggleQuickFilter = (quick) => {
    if (quick.tag) {
      const next = filters.tags.includes(quick.tag)
        ? filters.tags.filter((t) => t !== quick.tag)
        : [...filters.tags, quick.tag];
      update({ tags: next });
    } else {
      update({ maxPrice: filters.maxPrice === quick.maxPrice ? null : quick.maxPrice });
    }
  };

  const panel = (
    <FilterPanel
      filters={filters}
      onChange={update}
      onReset={reset}
      resultCount={results.length}
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="The full catalogue"
        title={filters.query ? `Results for “${filters.query}”` : 'Every cracker we make'}
        description={
          filters.query
            ? `${results.length} product${results.length === 1 ? '' : 's'} matched your search.`
            : 'Forty-three products across eight categories, all made on our own floor in Sivakasi and priced without a distributor in the middle.'
        }
        breadcrumbs={[{ label: 'Products' }]}
        art="aerial"
        artVariant={1}
      >
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((quick) => (
            <Chip
              key={quick.label}
              active={activeQuickFilter(quick)}
              onClick={() => toggleQuickFilter(quick)}
            >
              {quick.label}
            </Chip>
          ))}
        </div>
      </PageHeader>

      <div className="container pb-16 sm:pb-20">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[268px_minmax(0,1fr)]">
          {/* desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-4xl border border-line bg-white/85 p-6 shadow-card hide-scrollbar">
              {panel}
            </div>
          </aside>

          <div>
            {/* toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-white/85 px-4 py-3.5 shadow-soft sm:mb-7 sm:px-5 sm:py-4">
              <p className="text-sm text-muted">
                <strong className="font-semibold text-dark">{results.length}</strong> product
                {results.length === 1 ? '' : 's'}
              </p>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <span className="hidden text-muted sm:inline">Sort</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => update({ sort: e.target.value })}
                    className="max-w-[46vw] cursor-pointer truncate rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition-colors hover:border-secondary-300 focus:border-secondary-400 sm:max-w-none sm:px-4"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <Button
                  size="sm"
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setDrawerOpen(true)}
                  leftIcon={<SlidersHorizontal size={15} />}
                >
                  Filters
                </Button>
              </div>
            </div>

            {results.length ? (
              <div className={cn('transition-opacity duration-200', stale && 'opacity-60')}>
                <ProductGrid
                  products={results}
                  columns="xl:grid-cols-3"
                  paginate
                  pageSize={12}
                />
              </div>
            ) : (
              <EmptyState
                illustration={filters.query ? 'search' : 'crate'}
                title={filters.query ? `Nothing matched “${filters.query}”` : 'No products match those filters'}
                description="Loosen a filter or two — the whole catalogue is only 43 items, so narrow searches run out quickly."
                action={
                  <Button onClick={reset} rightIcon={<X size={15} />}>
                    Clear filters
                  </Button>
                }
                secondaryAction={
                  <Button to="/combos" variant="outline">
                    Browse combo packs
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-[95] lg:hidden">
            <motion.div
              variants={backdrop}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-dark/45 backdrop-blur-md"
            />
            <motion.div
              variants={drawerRight}
              initial="hidden"
              animate="show"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col bg-bg shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-semibold text-dark">Filters</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-soft transition-transform duration-300 hover:rotate-90"
                >
                  <X size={18} strokeWidth={2.4} />
                </button>
              </div>

              <div className="hide-scrollbar flex-1 overflow-y-auto p-5">{panel}</div>

              <div className="border-t border-line bg-white/85 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <Button onClick={() => setDrawerOpen(false)} className="w-full" size="lg">
                  Show {results.length} product{results.length === 1 ? '' : 's'}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default Products;
