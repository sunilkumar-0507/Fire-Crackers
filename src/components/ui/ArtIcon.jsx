import { Bolt, Flame, Gift, Rocket, Smiley, Sparkles, Spinner } from '@/components/ui/icons';

/**
 * The glyph on a category or package card's icon tile.
 *
 * `CrackerArt` is drawn for a 240-unit canvas; inside a 56px tile it reads as a
 * smudge. A single-stroke glyph survives the reduction, which is the whole job
 * of the tile — the full illustration still carries the product imagery.
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

export const ArtIcon = ({ art, size = 24, className }) => {
  const Glyph = BY_ART[art] ?? Sparkles;
  return <Glyph size={size} className={className} />;
};

export default ArtIcon;
