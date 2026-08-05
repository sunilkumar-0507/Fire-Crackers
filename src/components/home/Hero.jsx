import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Sparkles, Star } from 'lucide-react';
import { POPULAR_SEARCHES } from '@/constants';
import { products, categoriesWithCounts } from '@/data';
import { searchProducts } from '@/utils/search';
import { formatPrice } from '@/utils/format';
import { EASE, fadeUp, stagger, wordChild, wordContainer } from '@/animations/variants';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

const HEADLINE = ['Light', 'up', 'the', 'night,'];
const HEADLINE_ACCENT = ['the', 'Sivakasi', 'way.'];

/**
 * Decorative crackers that drift with the pointer via the shell's --px/--py.
 *
 * On a phone the column is only ~320px wide, so these sit *behind* the
 * headline rather than beside it. They are dropped to roughly half size and
 * pushed into the corners there, and the two innermost ones do not render at
 * all below `xl` — decoration should never compete with the search box.
 */
const FLOATERS = [
  { type: 'rocket', variant: 1, className: 'left-[1%] top-[8%] h-14 w-14 xs:h-16 xs:w-16 sm:left-[4%] sm:top-[16%] sm:h-32 sm:w-32', depth: 30, delay: 0 },
  { type: 'sparkler', variant: 1, className: 'right-[1%] top-[6%] h-14 w-14 xs:h-16 xs:w-16 sm:right-[6%] sm:top-[12%] sm:h-36 sm:w-36', depth: -26, delay: 1.1 },
  { type: 'flowerpot', variant: 1, className: 'bottom-[6%] left-[2%] h-14 w-14 xs:h-16 xs:w-16 sm:bottom-[16%] sm:left-[9%] sm:h-28 sm:w-28', depth: 20, delay: 0.6 },
  { type: 'chakkar', variant: 1, className: 'bottom-[8%] right-[2%] h-14 w-14 xs:h-16 xs:w-16 sm:bottom-[20%] sm:right-[9%] sm:h-32 sm:w-32', depth: -34, delay: 1.7 },
  { type: 'giftbox', variant: 1, className: 'right-[20%] top-[42%] hidden h-20 w-20 xl:block', depth: 16, delay: 2.2 },
  { type: 'aerial', variant: 1, className: 'left-[20%] top-[46%] hidden h-20 w-20 xl:block', depth: -18, delay: 1.4 },
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
    <section className="relative flex min-h-[calc(100svh-var(--header-h))] items-center overflow-hidden pb-14 pt-8 sm:pb-24 sm:pt-16">
      {/* floating decorative art */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {FLOATERS.map((floater, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.4 + i * 0.12, ease: EASE }}
            className={`absolute ${floater.className}`}
            style={{
              transform: `translate3d(calc(var(--px,0) * ${floater.depth}px), calc(var(--py,0) * ${floater.depth * 0.7}px), 0)`,
            }}
          >
            {/* The idle bob is a CSS keyframe, not a Framer loop — six of these
                running on the main thread was measurable on the hero. */}
            <div
              className="h-full w-full animate-float-slow"
              style={{ animationDuration: `${8 + i}s`, animationDelay: `${floater.delay}s` }}
            >
              <CrackerArt type={floater.type} variant={floater.variant} className="h-full w-full" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="container relative">
        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          {/* eyebrow */}
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-200/70 bg-white/85 px-3.5 py-2 text-center text-[10px] font-semibold uppercase tracking-[.14em] text-primary shadow-soft sm:gap-2.5 sm:px-4 sm:text-2xs sm:tracking-[.18em]">
              <Sparkles size={13} className="shrink-0 text-secondary-500" strokeWidth={2.4} />
              32 years in Sivakasi · Flat 75% off
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            variants={wordContainer}
            className="mt-7 font-display text-display-lg font-semibold text-dark"
          >
            <span className="sr-only">Light up the night, the Sivakasi way.</span>
            <span aria-hidden="true" className="block">
              {HEADLINE.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span variants={wordChild} className="inline-block">
                    {word}
                    {i < HEADLINE.length - 1 ? ' ' : ''}
                  </motion.span>
                </span>
              ))}
            </span>
            <span aria-hidden="true" className="block">
              {HEADLINE_ACCENT.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
                  <motion.span
                    variants={wordChild}
                    className="inline-block bg-gradient-to-br from-secondary-400 via-primary to-primary-700 bg-clip-text italic text-transparent"
                  >
                    {word}
                    {i < HEADLINE_ACCENT.length - 1 ? ' ' : ''}
                  </motion.span>
                </span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-muted sm:text-lg"
          >
            {products.length} crackers made on our own floor and sold at factory price. Search a
            name, open a category, or let a curated box decide for you.
          </motion.p>

          {/* search */}
          <motion.form variants={fadeUp} onSubmit={submit} className="group mt-8 w-full max-w-2xl sm:mt-9">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-flame-soft opacity-0 blur-lg transition-opacity duration-500 group-focus-within:opacity-50" />
              <div className="relative flex items-center gap-2 rounded-[2rem] border border-line bg-white/85 p-1.5 pl-4 shadow-card transition-shadow duration-500 group-focus-within:shadow-lift sm:p-2 sm:pl-6">
                <Search size={20} className="shrink-0 text-primary" strokeWidth={2.2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder="Search Lakshmi, flower pots, rockets…"
                  aria-label="Search crackers"
                  className="h-12 min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted/70 sm:h-14 sm:text-base"
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
            </div>

            <div className="mt-3 flex h-5 items-center justify-center">
              {liveCount != null ? (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xs text-muted"
                >
                  {liveCount === 0
                    ? 'No match yet — try a shorter word'
                    : `${liveCount} match${liveCount === 1 ? '' : 'es'} — press enter to see them`}
                </motion.p>
              ) : null}
            </div>
          </motion.form>

          {/* popular searches */}
          <motion.div variants={fadeUp} className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {POPULAR_SEARCHES.slice(0, 5).map((term) => (
              <Chip key={term} onClick={() => navigate(`/products?q=${encodeURIComponent(term)}`)}>
                {term}
              </Chip>
            ))}
          </motion.div>

          {/* CTAs — full-width stacked on a phone, so neither wraps to a
              two-line pill and both stay comfortably thumb-sized. */}
          <motion.div variants={fadeUp} className="mt-8 flex w-full flex-col items-stretch gap-3 xs:w-auto xs:flex-row xs:flex-wrap xs:items-center xs:justify-center sm:mt-9">
            <Button to="/products" size="lg" rightIcon={<ArrowRight size={18} />}>
              Shop all crackers
            </Button>
            <Button to="/combos" size="lg" variant="outline">
              Browse combo packs
            </Button>
          </motion.div>

          {/* stat strip */}
          <motion.dl
            variants={fadeUp}
            className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:mt-14 sm:grid-cols-4"
          >
            {[
              { label: 'Crackers', value: `${products.length}` },
              { label: 'Categories', value: `${categoriesWithCounts.length}` },
              { label: 'Starts at', value: formatPrice(60) },
              { label: 'Rated', value: '4.8', icon: true },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/85 px-3 py-4 sm:px-4 sm:py-5">
                <dd className="flex items-center justify-center gap-1 font-display text-xl font-semibold text-dark sm:text-2xl">
                  {stat.value}
                  {stat.icon ? <Star size={14} className="fill-secondary-500 text-secondary-500" /> : null}
                </dd>
                <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">{stat.label}</dt>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
