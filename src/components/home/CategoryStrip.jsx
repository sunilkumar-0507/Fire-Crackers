import { memo } from 'react';
import { Link } from 'react-router-dom';
import { categoriesWithCounts } from '@/data';
import { accentOf } from '@/constants/accents';

/**
 * The dark band of category names between the hero and the shelves.
 *
 * It is a scroller, not a marquee: the row overflows on narrow screens and you
 * push it with a finger or a trackpad. Nothing moves on its own, so a name is
 * readable the moment you look at it and a tap target never slides out from
 * under your thumb.
 *
 * Each name is painted in its category's own tone. All five clear AA against
 * the band — see the contrast table in `constants/accents.js`.
 */
const Sparkle = () => (
  <span aria-hidden="true" className="shrink-0 select-none text-sm text-bg/45">
    ✦
  </span>
);

export const CategoryStrip = memo(function CategoryStrip() {
  return (
    <nav aria-label="Shop by category" className="bg-dark">
      <ul className="hide-scrollbar flex items-center gap-5 overflow-x-auto px-4 py-3.5 sm:gap-7 sm:px-6">
        {categoriesWithCounts.map((category, i) => {
          const accent = accentOf(category.tone);
          return (
            <li key={category.id} className="flex shrink-0 items-center gap-5 sm:gap-7">
              {i > 0 ? <Sparkle /> : null}
              <Link
                to={`/category/${category.slug}`}
                className={`whitespace-nowrap font-display text-lg font-semibold italic transition-opacity hover:opacity-80 sm:text-xl ${accent.onDark}`}
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

export default CategoryStrip;
