import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from '@/components/ui/icons';
import { categoriesWithCounts, findCategory, products } from '@/data';
import { filterProducts, SORT_OPTIONS } from '@/utils/search';
import { artForCategory } from '@/utils/image';
import PageHeader from '@/components/ui/PageHeader';
import ProductGrid from '@/components/product/ProductGrid';
import Section from '@/components/ui/Section';
import CrackerArt from '@/components/ui/CrackerArt';
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

  const items = useMemo(
    () => (category ? filterProducts({ category: slug, sort }) : []),
    [category, slug, sort],
  );

  const others = useMemo(
    () => categoriesWithCounts.filter((c) => c.slug !== slug),
    [slug],
  );

  if (!category) {
    return (
      <div className="container py-24">
        <EmptyState
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
        artVariant={2}
        accent={category.accent}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-4 py-2 text-2xs font-semibold uppercase tracking-[.14em]"
            style={{ background: category.accentSoft, color: category.accent }}
          >
            {NOISE_COPY[category.noiseLevel]}
          </span>
        </div>
      </PageHeader>

      <div className="container pb-12 sm:pb-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-card px-4 py-3.5 shadow-soft sm:mb-7 sm:px-5 sm:py-4">
          <p className="text-sm text-muted">
            <strong className="font-semibold text-dark">{items.length}</strong> product
            {items.length === 1 ? '' : 's'} in {category.name}
          </p>

          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="max-w-[52vw] cursor-pointer truncate rounded-full border border-line bg-card px-3 py-2 text-sm font-medium text-ink outline-none transition-colors hover:border-secondary-300 focus:border-secondary-400 sm:max-w-none sm:px-4"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ProductGrid
          products={items}
          columns="lg:grid-cols-3 xl:grid-cols-4"
          paginate
          pageSize={12}
        />
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
                    <CrackerArt type={artForCategory(other.slug)} className="h-10 w-10 sm:h-12 sm:w-12" />
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
