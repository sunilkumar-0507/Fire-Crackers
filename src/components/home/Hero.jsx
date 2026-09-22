import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from '@/components/ui/icons';
import { BRAND } from '@/constants';
import { products, featuredProducts, bestSellers, categoriesWithCounts } from '@/data';
import { primaryImage } from '@/utils/image';
import Button from '@/components/ui/Button';

/**
 * Landing hero.
 *
 * Copy on the left, the actual product photography on the right.
 *
 * What used to sit in that right column was a fireworks canvas, a breathing
 * glow and three catalogue glyphs drifting on separate cycles — a generated
 * picture of a firework shop rather than a picture of this one. It is gone.
 * The column now shows boxes we photographed and sell, which is both the
 * honest thing to put at the top of a shop and the thing a visitor is
 * actually deciding between.
 *
 * The tiles are chosen from live catalogue data, not hard-coded, so the hero
 * can never front a product that has been taken off the shelf — the same rule
 * the category covers follow. Only products whose photo we genuinely ship are
 * eligible: a tile that fell back to an icon would put exactly the kind of
 * stand-in art back on the page that this section exists to keep off it.
 */

/** How many photographs the composition holds. */
const TILE_COUNT = 3;

/**
 * The first `TILE_COUNT` products with real photography, preferring the ones
 * the shop already promotes. Deduped by image, so a repeated pack shot cannot
 * fill two of the three frames.
 */
const pickTiles = () => {
  const seen = new Set();
  const tiles = [];

  for (const item of [...featuredProducts, ...bestSellers, ...products]) {
    if (tiles.length === TILE_COUNT) break;

    const image = primaryImage(item);
    if (image.kind !== 'url' || seen.has(image.src)) continue;

    seen.add(image.src);
    tiles.push({ slug: item.slug, name: item.name, src: image.src });
  }

  return tiles;
};

/**
 * One framed pack shot.
 *
 * The photographs are catalogue shots on white at around 240px, so they are
 * contained rather than cropped — scaling one up to fill a bleed would show
 * every artefact in it. The frame is white rather than the page's cream `card`
 * for the same reason the tiles are contained: on cream, each shot's own white
 * background read as a second, paler rectangle floating inside the border.
 *
 * `eager` on the first tile only: it is the one that lands inside the fold.
 */
const PhotoTile = ({ tile, className, eager = false }) => (
  <Link
    to={`/product/${tile.slug}`}
    className={`group relative overflow-hidden rounded-3xl border border-line bg-white p-2.5 shadow-card sm:p-3 transition-colors hover:border-primary-200 focus-visible:border-primary ${className}`}
  >
    <img
      src={tile.src}
      alt={tile.name}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      className="h-full w-full object-contain"
    />
    <span className="sr-only">{tile.name}</span>
  </Link>
);

export const Hero = () => {
  const tiles = useMemo(pickTiles, []);

  return (
    <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
      {/* The only decoration left: one soft, static warm wash in the corner
          the photographs sit in. Pure CSS, no canvas, nothing that moves, so
          there is nothing here to turn off for reduced motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(255,178,56,.30) 0%, rgba(255,178,56,.12) 45%, transparent 72%)',
        }}
      />

      <div className="container relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <div className="flex flex-col items-start text-left">
            {/* `items-start`, not `items-center`: the label wraps to two lines on a
                320px handset, and centred the dot floated in the gap between
                them instead of marking the first word. */}
            <p className="flex items-start gap-2 text-2xs font-semibold uppercase tracking-[.18em] text-primary-700">
              <span
                aria-hidden="true"
                className="mt-[.42em] h-1.5 w-1.5 shrink-0 rounded-full bg-secondary-500"
              />
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
            <div className="mt-8 flex w-full flex-col items-stretch gap-3 xs:w-auto xs:flex-row xs:flex-wrap xs:items-center">
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
          </div>

          {/*
            The photographs.

            Three tiles in a row on a phone, where the column has no height to
            spend and a row reads as a shelf. From `lg` it becomes the bento the
            reference lays out: one tall frame beside two square ones, sized off
            the grid track rather than off a viewport unit so it keeps its
            proportions between breakpoints.

            The section omits itself entirely when the catalogue has no
            photography to show — an empty grid of borders would be worse than
            copy that simply runs full width.
          */}
          {tiles.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-2 lg:grid-rows-2">
                <PhotoTile
                  eager
                  tile={tiles[0]}
                  className="aspect-square lg:row-span-2 lg:aspect-[4/5]"
                />
                {tiles.slice(1).map((tile) => (
                  <PhotoTile key={tile.slug} tile={tile} className="aspect-square" />
                ))}
              </div>

              <p className="mt-3 text-2xs text-muted">
                Every picture here is the box that arrives.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Hero;
