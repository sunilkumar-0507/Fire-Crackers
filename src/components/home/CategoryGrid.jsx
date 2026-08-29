import { Link } from 'react-router-dom';
import { ArrowUpRight, SlidersHorizontal } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { categoriesWithCounts } from '@/data';
import { accentOf } from '@/constants/accents';
import { artForCategory } from '@/utils/image';
import Section, { SectionHeading } from '@/components/ui/Section';
import ArtIcon from '@/components/ui/ArtIcon';
import ProductImage from '@/components/ui/ProductImage';
import Button from '@/components/ui/Button';

const NOISE_LABEL = {
  silent: 'Silent',
  low: 'Low noise',
  medium: 'Medium',
  high: 'Loud',
  mixed: 'Mixed',
};

/**
 * One category tile.
 *
 * Carries the same accent tile as a package card, so a category and a bundle
 * announce themselves the same way. The picture is the real photograph of the
 * category's featured product — the only place on the home page a shopper
 * sees what the category physically looks like.
 */
const CategoryCard = ({ category, index }) => {
  const accent = accentOf(category.tone);
  const art = artForCategory(category.slug);

  return (
    // The first tile is the feature: full width in the two-column phone grid,
    // a 2×2 block from `sm` up.
    <div className={index === 0 ? 'col-span-2 sm:row-span-2' : ''}>
      <Link
        to={`/category/${category.slug}`}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-card p-4 shadow-card transition-colors duration-200 xs:p-5 sm:p-7',
          accent.ring,
        )}
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <span
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-2xl sm:h-12 sm:w-12',
              accent.tile,
              accent.glow,
            )}
          >
            <ArtIcon art={art} size={20} />
          </span>

          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary-50 text-primary transition-colors duration-200 group-hover:bg-dark group-hover:text-bg sm:h-9 sm:w-9">
            <ArrowUpRight size={15} />
          </span>
        </div>

        <p className={cn('mt-4 truncate text-2xs font-semibold uppercase tracking-[.12em]', accent.text)}>
          {NOISE_LABEL[category.noiseLevel]}
        </p>
        <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-dark xs:text-lg sm:text-2xl">
          {category.name}
        </h3>
        <p className="mt-1 font-display text-xs text-muted sm:text-sm">{category.tamilName}</p>

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

        {/* The feature tile spans two grid rows, so it is roughly twice as
            tall as its own content. Giving its photo block `flex-1` lets the
            picture absorb that height instead of leaving a 300px hole between
            the tagline and the footer. */}
        <div
          className={cn(
            'relative mt-auto',
            index === 0 ? 'h-36 xs:h-48 sm:h-auto sm:max-h-72 sm:flex-1' : 'h-20 sm:h-28',
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-20 opacity-25"
            style={{
              background: `radial-gradient(55% 100% at 50% 100%, ${category.accent}, transparent 72%)`,
            }}
          />
          {/* Decorative: the tile already names the category in text, so the
              photo carries no information a screen reader would miss.

              Positioned rather than centred in a grid: a percentage height on
              a grid item in an auto-sized row resolves to `auto`, and the
              photo would then take its own aspect ratio and spill past the
              tile. Absolute insets give it a definite box to fit inside. */}
          <ProductImage
            source={category.cover}
            alt=""
            fallbackType={art}
            className="absolute inset-0 h-full w-full object-contain pt-5 sm:pt-6"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3.5 sm:pt-4">
          <span className="truncate text-xs font-semibold text-dark sm:text-sm">
            {category.productCount} product{category.productCount === 1 ? '' : 's'}
          </span>
          <span className="hidden shrink-0 text-2xs font-semibold uppercase tracking-[.14em] text-muted transition-colors group-hover:text-primary xs:block">
            Explore
          </span>
        </div>
      </Link>
    </div>
  );
};

export const CategoryGrid = () => (
  <Section id="categories">
    <div className="container">
      <SectionHeading
        eyebrow="Shop by category"
        icon={<SlidersHorizontal size={13} />}
        title="Eight ways to fill a night sky"
        description="From a silent sparkler a four-year-old can hold to a 240-shot battery that needs a licensed ground and a marshal."
        action={
          <Button to="/products" variant="outline" size="md">
            View all {categoriesWithCounts.reduce((n, c) => n + c.productCount, 0)} products
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {categoriesWithCounts.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>
    </div>
  </Section>
);

export default CategoryGrid;
