import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Phone, Search, Star } from '@/components/ui/icons';
import { BRAND, POPULAR_SEARCHES } from '@/constants';
import { ACCENT_KEYS, accentOf } from '@/constants/accents';
import { products, categoriesWithCounts } from '@/data';
import { searchProducts } from '@/utils/search';
import { formatPrice } from '@/utils/format';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

/**
 * Landing hero.
 *
 * Left-aligned rather than centred: the headline, the sub-line and the buttons
 * now share one left edge with the section headings further down the page, so
 * the eye tracks straight from the proposition into the shelves.
 *
 * The confetti behind it is a fixed list of positions, not a generator — the
 * same dots land in the same places on every render and none of them move.
 */
const FLOATERS = [
  { type: 'rocket', variant: 1, className: 'right-[6%] top-[6%] h-24 w-24 lg:h-32 lg:w-32' },
  { type: 'sparkler', variant: 1, className: 'right-[26%] top-[34%] h-20 w-20 lg:h-24 lg:w-24' },
  { type: 'flowerpot', variant: 1, className: 'bottom-[6%] right-[14%] h-20 w-20 lg:h-24 lg:w-24' },
];

/* Scattered by hand: x%, y%, px size, tone index. */
const CONFETTI = [
  [4, 18, 5, 3], [11, 62, 4, 2], [7, 88, 6, 0], [18, 8, 4, 4],
  [23, 41, 5, 1], [16, 33, 3, 0], [31, 76, 4, 3], [37, 14, 5, 2],
  [44, 92, 4, 1], [52, 6, 6, 4], [58, 55, 4, 0], [63, 24, 5, 3],
  [69, 81, 4, 2], [74, 12, 5, 1], [81, 47, 4, 4], [86, 70, 6, 0],
  [91, 29, 4, 3], [96, 58, 5, 2],
];

const Confetti = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {CONFETTI.map(([x, y, size, tone]) => (
      <span
        key={`${x}-${y}`}
        className="absolute rounded-full"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          background: accentOf(ACCENT_KEYS[tone]).hex,
          opacity: 0.55,
        }}
      />
    ))}
  </div>
);

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
      <Confetti />

      {/* Static decorative art, hidden below `lg` where the text column runs
          the full width and decoration would sit under the search box. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        {FLOATERS.map((floater) => (
          <div key={floater.type} className={`absolute opacity-60 ${floater.className}`}>
            <CrackerArt type={floater.type} variant={floater.variant} className="h-full w-full" />
          </div>
        ))}
      </div>

      <div className="container relative">
        <div className="flex max-w-3xl flex-col items-start text-left">
          <p className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[.18em] text-primary-700">
            <Flame size={14} className="shrink-0 text-secondary-600" />
            Sivakasi · direct from the factory
          </p>

          {/* The italic serif clause is the emphasis, not a colour change on a
              full line — it marks the one word the sentence turns on. */}
          <h1 className="mt-4 font-display text-display-lg font-semibold text-dark">
            Light up Diwali <em className="mr-[.06em] text-primary-700">without</em> lighting up your budget.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {products.length} crackers across {categoriesWithCounts.length} categories, made on our
            own floor and sold at factory price. Pick your quantities, or let a curated box decide
            for you.
          </p>

          {/* CTAs — full-width stacked on a phone so neither wraps to a two-line
              pill and both stay comfortably thumb-sized. The phone number sits
              alongside them because a good share of orders here are still
              placed by call. */}
          <div className="mt-7 flex w-full flex-col items-stretch gap-3 xs:w-auto xs:flex-row xs:flex-wrap xs:items-center">
            <Button to="/products" size="lg" rightIcon={<ArrowRight size={18} />}>
              See the price list
            </Button>
            <Button href={BRAND.phoneHref} size="lg" variant="outline" leftIcon={<Phone size={16} />}>
              {BRAND.phone}
            </Button>
            <Button to="/combos" size="lg" variant="outline">
              Browse combo packs
            </Button>
          </div>

          {/* search */}
          <form onSubmit={submit} className="mt-8 w-full max-w-2xl">
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

            <div className="mt-2.5 flex h-5 items-center">
              {liveCount != null ? (
                <p className="text-2xs text-muted">
                  {liveCount === 0
                    ? 'No match yet — try a shorter word'
                    : `${liveCount} match${liveCount === 1 ? '' : 'es'} — press enter to see them`}
                </p>
              ) : null}
            </div>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {POPULAR_SEARCHES.slice(0, 4).map((term) => (
              <Chip key={term} onClick={() => navigate(`/products?q=${encodeURIComponent(term)}`)}>
                {term}
              </Chip>
            ))}
          </div>

          {/* stat strip */}
          <dl className="mt-9 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4">
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
                <dt className="mt-1 text-center text-2xs text-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Hero;
