import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Phone, Search } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { BRAND, POPULAR_SEARCHES } from '@/constants';
import { ACCENT_KEYS, accentOf } from '@/constants/accents';
import { products, categoriesWithCounts, priceBounds, deepestDiscount } from '@/data';
import { searchProducts } from '@/utils/search';
import { formatPrice } from '@/utils/format';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import Fireworks from '@/components/fx/Fireworks';
import HeroAura from '@/components/home/HeroAura';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

/**
 * Landing hero.
 *
 * Left-aligned rather than centred: the headline, the sub-line and the buttons
 * now share one left edge with the section headings further down the page, so
 * the eye tracks straight from the proposition into the shelves.
 *
 * The confetti behind it is a fixed list of positions, not a generator, so the
 * same dots land in the same places on every render. They twinkle in place —
 * opacity only, never moving — which reads as depth rather than as motion.
 *
 * The decorative column on the right lives in `HeroAura`.
 */

/* Scattered by hand: x%, y%, px size, tone index. */
const CONFETTI = [
  [4, 18, 5, 3], [11, 62, 4, 2], [7, 88, 6, 0], [18, 8, 4, 4],
  [23, 41, 5, 1], [16, 33, 3, 0], [31, 76, 4, 3], [37, 14, 5, 2],
  [44, 92, 4, 1], [52, 6, 6, 4], [58, 55, 4, 0], [63, 24, 5, 3],
  [69, 81, 4, 2], [74, 12, 5, 1], [81, 47, 4, 4], [86, 70, 6, 0],
  [91, 29, 4, 3], [96, 58, 5, 2],
];

const Confetti = ({ still = false }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {CONFETTI.map(([x, y, size, tone], i) => (
      <span
        key={`${x}-${y}`}
        className={`absolute rounded-full ${still ? '' : 'animate-twinkle'}`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          background: accentOf(ACCENT_KEYS[tone]).hex,
          opacity: 0.55,
          // Staggered off the index so no two neighbours pulse together and
          // the field never flashes as one.
          animationDelay: still ? undefined : `${(i % 7) * 0.55}s`,
          animationDuration: still ? undefined : `${4 + (i % 4)}s`,
        }}
      />
    ))}
  </div>
);

export const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Fireworks are the one thing on this page that genuinely should not run for
  // somebody who has asked their system for less motion. They fall back to the
  // static glyphs that stood here before.
  const stillness = usePrefersReducedMotion();

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
      <Confetti still={stillness} />

      {/*
        The decorative side of the hero: the fireworks canvas with the drifting
        art, the glow and the embers layered over it.

        Two things keep all of it off the copy at every width, without a
        breakpoint per element. The box is right-anchored and never wider than
        roughly half, so it does not reach the text column's left edge. And the
        mask fades it towards the bottom-left — the corner the headline and the
        search bar grow into — so the busiest part is always the empty
        top-right, whatever the viewport does to the layout underneath.

        Both motion states render the same box now. Asking for reduced motion
        used to swap in a different, `lg`-only composition, which meant a
        visitor on a phone with that setting on got a completely bare hero.
        They get the same picture as everyone else; it simply holds still.
      */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-0 top-0',
          // Phone: the copy runs the full width, so there is no free column to
          // sit in. It sits behind the headline band instead — large, dark
          // display type with contrast to spare — and stops above the body
          // paragraph, which is the text that would actually suffer. A fixed
          // height rather than a percentage, so that holds on every handset
          // instead of only the one it was measured against.
          'h-52 w-[72%] opacity-75',
          // From `sm` the text column stops short of the right edge, so it gets
          // more presence — but the same short height, because the body
          // paragraph still runs underneath it until `lg`.
          'sm:w-[58%] sm:opacity-90',
          // From `lg` the hero has a genuine empty half. Full height, full
          // strength, and nothing of the copy anywhere near it.
          'lg:inset-y-0 lg:h-auto lg:w-[52%] lg:opacity-100',
        )}
        style={{
          maskImage: 'radial-gradient(125% 115% at 84% 18%, #000 46%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(125% 115% at 84% 18%, #000 46%, transparent 88%)',
        }}
      >
        {/* The canvas is the one piece that genuinely should not run for
            somebody who asked for less motion — it is the only thing here
            that animates continuously and unpredictably. */}
        {stillness ? null : <Fireworks />}
        <HeroAura still={stillness} />
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
                placeholder="Search Lakshmi, flower pots, sky shots…"
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
              { label: 'Starts at', value: formatPrice(priceBounds.min) },
              { label: 'Off MRP', value: `${deepestDiscount}%` },
            ].map((stat) => (
              <div key={stat.label} className="bg-card px-3 py-4 sm:px-4 sm:py-5">
                <dd className="flex items-center justify-center gap-1 font-display text-xl font-semibold text-dark sm:text-2xl">
                  {stat.value}
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
