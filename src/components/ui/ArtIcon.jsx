import { Bolt, Flame, Gift, Rocket, Smiley, Sparkles, Spinner } from '@/components/ui/icons';

/**
 * The glyph that stands for a cracker type.
 *
 * Every art type in the catalogue maps to one icon from the app's own set
 * (`components/ui/icons.jsx` — Themify and Font Awesome 6). Nothing here is
 * drawn by hand: a rocket is the rocket glyph, a gift box is the gift glyph,
 * and swapping one means editing the table below rather than editing a path.
 *
 * Sizing follows the caller. Pass `size` for a fixed pixel box, or a `className`
 * with height and width utilities (`h-full w-full`) to fill the container — the
 * CSS wins over the SVG's own attributes, so both work.
 */
const BY_ART = {
  sparkler: Sparkles,
  flowerpot: Flame,
  chakkar: Spinner,
  rocket: Rocket,
  aerial: Rocket,
  bomb: Bolt,
  kids: Smiley,
  giftbox: Gift,
};

export const ArtIcon = ({ art, size, className, title }) => {
  const Glyph = BY_ART[art] ?? Sparkles;
  return <Glyph size={size} title={title} className={className} />;
};

export default ArtIcon;
