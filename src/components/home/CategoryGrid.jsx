import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { categoriesWithCounts } from '@/data';
import { artForCategory } from '@/utils/image';
import { useTilt } from '@/hooks/useTilt';
import { fadeUp, inView, stagger } from '@/animations/variants';
import Section, { SectionHeading } from '@/components/ui/Section';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';

const NOISE_LABEL = {
  silent: 'Silent',
  low: 'Low noise',
  medium: 'Medium',
  high: 'Loud',
  mixed: 'Mixed',
};

const CategoryCard = ({ category, index }) => {
  const tilt = useTilt({ max: 9, scale: 1.02 });

  return (
    // The first tile is the feature: full width in the two-column phone grid,
    // a 2×2 block from `sm` up.
    <motion.div variants={fadeUp} className={index === 0 ? 'col-span-2 sm:row-span-2' : ''}>
      <Link
        to={`/category/${category.slug}`}
        ref={tilt.ref}
        onPointerEnter={tilt.onPointerEnter}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        style={tilt.style}
        className="group relative flex h-full flex-col overflow-hidden rounded-4xl border border-white/60 p-4 shadow-card transition-shadow duration-500 ease-luxe hover:shadow-lift xs:p-5 sm:p-7"
      >
        {/* tinted glass base */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(150deg, ${category.accentSoft} 0%, rgba(255,255,255,.92) 55%, ${category.accentSoft} 100%)`,
          }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `radial-gradient(320px circle at var(--mx,50%) var(--my,50%), ${category.accent}33, transparent 62%)`,
          }}
        />

        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[.14em] sm:text-2xs sm:tracking-[.18em]" style={{ color: category.accent }}>
              {NOISE_LABEL[category.noiseLevel]}
            </p>
            <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-dark xs:text-lg sm:mt-2 sm:text-2xl">
              {category.name}
            </h3>
            <p className="mt-1 font-display text-xs text-muted sm:text-sm">{category.tamilName}</p>
          </div>

          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 text-dark shadow-soft transition-all duration-500 ease-luxe group-hover:rotate-45 group-hover:bg-dark group-hover:text-bg sm:h-9 sm:w-9">
            <ArrowUpRight size={16} strokeWidth={2.4} />
          </span>
        </div>

        {/* Two lines of blurb do not fit a half-width tile without crowding
            the art out; the feature tile keeps them at every size. */}
        <p
          className={cn(
            'mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted',
            index === 0 ? '' : 'hidden sm:block',
          )}
        >
          {category.tagline}
        </p>

        <div
          className={cn(
            'relative mt-auto grid place-items-center pt-5 sm:pt-6',
            index === 0 ? 'h-36 xs:h-48 sm:h-64' : 'h-20 sm:h-28',
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 opacity-45 transition-opacity duration-700 group-hover:opacity-85"
            style={{ background: `radial-gradient(55% 100% at 50% 100%, ${category.accent}, transparent 72%)` }}
          />
          <CrackerArt
            type={artForCategory(category.slug)}
            variant={(index % 4) + 1}
            className="relative h-full w-auto transition-transform duration-[900ms] ease-luxe group-hover:-translate-y-2 group-hover:scale-110"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/70 pt-3.5 sm:pt-4">
          <span className="truncate text-xs font-semibold text-dark sm:text-sm">
            {category.productCount} product{category.productCount === 1 ? '' : 's'}
          </span>
          <span className="hidden shrink-0 text-2xs font-semibold uppercase tracking-[.14em] text-muted transition-colors group-hover:text-primary xs:block">
            Explore
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export const CategoryGrid = () => (
  <Section id="categories">
    <div className="container">
      <SectionHeading
        eyebrow="Shop by category"
        title="Eight ways to fill a night sky"
        description="From a silent sparkler a four-year-old can hold to a 240-shot battery that needs a licensed ground and a marshal."
        action={
          <Button to="/products" variant="outline" size="md">
            View all {categoriesWithCounts.reduce((n, c) => n + c.productCount, 0)} products
          </Button>
        }
      />

      <motion.div
        variants={stagger(0.07)}
        {...inView}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
      >
        {categoriesWithCounts.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </motion.div>
    </div>
  </Section>
);

export default CategoryGrid;
