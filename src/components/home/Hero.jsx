import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Phone, Search, Star } from '@/components/ui/icons';
import { BRAND, POPULAR_SEARCHES } from '@/constants';
import { products, categoriesWithCounts } from '@/data';
import { searchProducts } from '@/utils/search';
import { formatPrice } from '@/utils/format';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

/**
 * Landing hero.
 *
 * Rebuilt around what a visitor actually needs in the first screen: what this
 * shop sells, what it costs, and a way in. What went:
 *
 *  - **`min-h-[calc(100svh-header)]`.** A full-viewport hero guarantees that
 *    nothing purchasable is visible until you scroll. It is now sized by its
 *    own content, so the category grid starts within the first screen on a
 *    laptop and just below the fold on a phone.
 *  - **Six pointer-tracked floating crackers.** They drifted behind the
 *    headline and the search box, at up to 36px of parallax travel. Three
 *    remain, static, and only from `sm` up where there is room for them.
 *  - **The word-by-word blur-in headline.** The main proposition on the page
 *    took roughly a second to become readable.
 */
const FLOATERS = [
  { type: 'rocket', variant: 1, className: 'left-[3%] top-[12%] h-24 w-24 lg:h-28 lg:w-28' },
  { type: 'sparkler', variant: 1, className: 'right-[4%] top-[8%] h-24 w-24 lg:h-32 lg:w-32' },
  { type: 'flowerpot', variant: 1, className: 'bottom-[8%] right-[8%] h-20 w-20 lg:h-24 lg:w-24' },
];

export const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Live count under the input — reassurance that typing is doing something.
  const liveCount = useMemo(
    () => (query.trim().length > 1 ? searchProducts(query).length : null),
    [query],
  );

  const submit = (event) => {
    event?.preventDefault();
    const term = query.trim();
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : '/products');
  };

  return (
    <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
      {/* Static decorative art, hidden below `sm` where the column is only
          ~320px wide and decoration would sit under the search box. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
        {FLOATERS.map((floater) => (
          <div key={floater.type} className={`absolute opacity-70 ${floater.className}`}>
            <CrackerArt type={floater.type} variant={floater.variant} className="h-full w-full" />
          </div>
        ))}
      </div>

      <div className="container relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-200 bg-card px-4 py-2 text-2xs font-semibold text-primary-700">
              <Star size={13} className="shrink-0 fill-secondary-500 text-secondary-500" />
              32 years in Sivakasi · Flat 75% off
            </span>
          </div>

          <h1 className="mt-5 font-display text-display-lg font-semibold text-dark">
            Light up the night,{' '}
            <span className="text-primary-700">the Sivakasi way.</span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg">
            {products.length} crackers made on our own floor and sold at factory price. Search a
            name, open a category, or let a curated box decide for you.
          </p>

          {/* search */}
          <form onSubmit={submit} className="mt-7 w-full max-w-2xl">
            <div className="flex items-center gap-2 rounded-full border border-line bg-card p-1.5 pl-4 shadow-card focus-within:border-primary sm:pl-5">
              <Search size={20} className="shrink-0 text-primary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search Lakshmi, flower pots, rockets…"
                aria-label="Search crackers"
                className="h-12 min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted sm:h-14 sm:text-base"
              />
              {/* Icon-only below sm — a labelled pill would take a third of
                  the bar and squeeze the placeholder out. */}
              <Button
                type="submit"
                size="icon"
                onClick={submit}
                aria-label="Search"
                className="shrink-0 sm:hidden"
              >
                <ArrowRight size={17} />
              </Button>
              <Button
                type="submit"
                size="md"
                onClick={submit}
                className="hidden shrink-0 sm:inline-flex"
                rightIcon={<ArrowRight size={16} />}
              >
                Search
              </Button>
            </div>

            <div className="mt-2.5 flex h-5 items-center justify-center">
              {liveCount != null ? (
                <p className="text-2xs text-muted">
                  {liveCount === 0
                    ? 'No match yet — try a shorter word'
                    : `${liveCount} match${liveCount === 1 ? '' : 'es'} — press enter to see them`}
                </p>
              ) : null}
            </div>
          </form>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {POPULAR_SEARCHES.slice(0, 4).map((term) => (
              <Chip key={term} onClick={() => navigate(`/products?q=${encodeURIComponent(term)}`)}>
                {term}
              </Chip>
            ))}
          </div>

          {/* CTAs — full-width stacked on a phone, so neither wraps to a
              two-line pill and both stay comfortably thumb-sized. A phone
              number sits alongside them because a good share of orders here
              are still placed by call. */}
          <div
            className="mt-7 flex w-full flex-col items-stretch gap-3 xs:w-auto xs:flex-row xs:flex-wrap xs:items-center xs:justify-center"
          >
            <Button to="/products" size="lg" rightIcon={<ArrowRight size={18} />}>
              Shop all crackers
            </Button>
            <Button to="/combos" size="lg" variant="outline">
              Browse combo packs
            </Button>
            <Button
              href={BRAND.phoneHref}
              size="lg"
              variant="ghost"
              leftIcon={<Phone size={17} />}
            >
              {BRAND.phone}
            </Button>
          </div>

          {/* stat strip */}
          <dl
            className="mt-9 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4"
          >
            {[
              { label: 'Crackers', value: `${products.length}` },
              { label: 'Categories', value: `${categoriesWithCounts.length}` },
              { label: 'Starts at', value: formatPrice(60) },
              { label: 'Rated', value: '4.8', icon: true },
            ].map((stat) => (
              <div key={stat.label} className="bg-card px-3 py-4 sm:px-4 sm:py-5">
                <dd className="flex items-center justify-center gap-1 font-display text-xl font-semibold text-dark sm:text-2xl">
                  {stat.value}
                  {stat.icon ? (
                    <Star size={14} className="fill-secondary-500 text-secondary-500" />
                  ) : null}
                </dd>
                <dt className="mt-1 text-2xs text-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Hero;
