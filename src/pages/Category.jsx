import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Search, X } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { categoriesWithCounts, findCategory, products } from '@/data';
import { filterProducts, SORT_OPTIONS } from '@/utils/search';
import { analytics } from '@/lib/analytics';
import { artForCategory } from '@/utils/image';
import { accentOf } from '@/constants/accents';
import PageHeader from '@/components/ui/PageHeader';
import ProductGrid from '@/components/product/ProductGrid';
import Section from '@/components/ui/Section';
import ArtIcon from '@/components/ui/ArtIcon';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

const NOISE_COPY = {
  silent: 'Nothing in this category produces a report.',
  low: 'Low noise — a crackle at most, no bang.',
  medium: 'Moderate noise. Keep the safe distance.',
  high: 'Loud. Open ground and ear care for children.',
  mixed: 'A mix of quiet and loud items.',
};

export const Category = () => {
  const { slug } = useParams();
  const category = findCategory(slug);
  const [sort, setSort] = useState('relevance');
  const [query, setQuery] = useState('');

  // Deferred so the grid re-rendering behind a fast typist never makes the
  // field itself feel sticky; `filterProducts` already scores the search.
  const deferredQuery = useDeferredValue(query);

  const items = useMemo(
    () => (category ? filterProducts({ category: slug, sort, query: deferredQuery }) : []),
    [category, slug, sort, deferredQuery],
  );

  const others = useMemo(
    () => categoriesWithCounts.filter((c) => c.slug !== slug),
    [slug],
  );

  useEffect(() => {
    if (category) analytics.categoryView(category);
  }, [category]);

  // A term typed in one category should not follow you into the next and show
  // an empty grid for a category that is actually full.
  useEffect(() => {
    setQuery('');
  }, [slug]);

  if (!category) {
    return (
      <div className="container py-24">
        <EmptyState
          as="h1"
          illustration="crate"
          title="No such category"
          description="That category link does not match anything we stock. Here is the full catalogue instead."
          action={<Button to="/products">Browse all crackers</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`${category.tamilName} · ${category.productCount} products`}
        title={category.name}
        description={category.description}
        breadcrumbs={[{ label: 'Products', to: '/products' }, { label: category.name }]}
        art={artForCategory(category.slug)}
        accent={category.accent}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              'rounded-full px-4 py-2 text-2xs font-semibold uppercase tracking-[.14em]',
              accentOf(category.tone).pill,
            )}
          >
            {NOISE_COPY[category.noiseLevel]}
          </span>
        </div>
      </PageHeader>

      <div className="container pb-12 sm:pb-16">
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-line bg-card px-4 py-3.5 shadow-soft sm:mb-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <p className="text-sm text-muted">
            <strong className="font-semibold text-dark">{items.length}</strong> product
            {items.length === 1 ? '' : 's'}
            {query.trim() ? <> matching “{query.trim()}”</> : <> in {category.name}</>}
          </p>

          {/* Searching inside the category rather than across the shop: this
              page exists because somebody already chose a category, and the
              navbar's search is there for widening back out. */}
          <label className="relative flex-1 sm:max-w-xs">
            <span className="sr-only">Search in {category.name}</span>
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search in ${category.name}`}
              className="min-h-11 w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-9 text-sm text-ink outline-none transition-colors placeholder:text-muted hover:border-secondary-300 focus:border-secondary-400"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear the search"
                className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-secondary-50 hover:text-ink"
              >
                <X size={12} />
              </button>
            ) : null}
          </label>

          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="max-w-[52vw] min-h-11 cursor-pointer truncate rounded-full border border-line bg-card px-3 py-2.5 text-sm font-medium text-ink outline-none transition-colors hover:border-secondary-300 focus:border-secondary-400 sm:max-w-none sm:px-4"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title={query.trim() ? `Nothing in ${category.name} matches “${query.trim()}”` : 'Nothing here yet'}
            hint={
              query.trim()
                ? 'Try a shorter word, or search the whole shop instead.'
                : 'This category has no products on sale at the moment.'
            }
            action={
              query.trim() ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => setQuery('')}>
                    Clear the search
                  </Button>
                  <Button to={`/products?q=${encodeURIComponent(query.trim())}`}>
                    Search all products
                  </Button>
                </div>
              ) : (
                <Button to="/products">Browse all crackers</Button>
              )
            }
          />
        ) : (
          <ProductGrid
            products={items}
            columns="lg:grid-cols-3 xl:grid-cols-4"
            paginate
            pageSize={12}
          />
        )}
      </div>

      {/* other categories */}
      <Section spacing="sm" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
        <div className="container">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
            <h2 className="font-display text-xl font-semibold text-dark sm:text-2xl">Other categories</h2>
            <Link
              to="/products"
              className="group flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
            >
              All {products.length} products
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {others.map((other) => (
              <div key={other.id}>
                <Link
                  to={`/category/${other.slug}`}
                  className="group flex h-full flex-col items-center gap-2.5 rounded-3xl border border-line bg-card p-4 text-center shadow-soft transition-all duration-500 ease-luxe hover:-translate-y-1.5 hover:shadow-lift sm:gap-3 sm:p-5"
                >
                  <span
                    className="grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-500 ease-luxe group-hover:scale-110 sm:h-16 sm:w-16"
                    style={{ background: other.accentSoft }}
                  >
                    <ArtIcon art={artForCategory(other.slug)} className="h-10 w-10 text-dark sm:h-12 sm:w-12" />
                  </span>
                  <span className="text-xs font-semibold leading-snug text-dark transition-colors group-hover:text-primary">
                    {other.name}
                  </span>
                  <span className="mt-auto text-2xs text-muted">{other.productCount} items</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
};

export default Category;
