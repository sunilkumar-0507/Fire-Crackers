/**
 * Image resolution.
 *
 * Products carry `images: ["rocket/2", ...]`. Today those resolve to generated
 * vector art; when a real API arrives it will send absolute URLs instead, and
 * `resolveImage` already routes those to an `<img>` without any other change.
 */

const ART_TYPES = new Set([
  'rocket',
  'flowerpot',
  'sparkler',
  'chakkar',
  'aerial',
  'bomb',
  'kids',
  'giftbox',
]);

const isUrl = (value) => typeof value === 'string' && /^(https?:|data:|\/)/.test(value);

/**
 * @returns {{kind:'url', src:string} | {kind:'art', type:string, variant:number}}
 */
export const resolveImage = (value, fallbackType = 'rocket') => {
  if (isUrl(value)) return { kind: 'url', src: value };

  const [type, variant] = String(value ?? '').split('/');
  return {
    kind: 'art',
    type: ART_TYPES.has(type) ? type : fallbackType,
    variant: Number(variant) || 1,
  };
};

/** First image of a product, or a category-appropriate placeholder. */
export const primaryImage = (item, fallbackType = 'rocket') =>
  resolveImage(item?.images?.[0] ?? item?.art, fallbackType);

/** Maps a category slug to the art type used for its illustration. */
export const CATEGORY_ART = {
  sparklers: 'sparkler',
  'flower-pots': 'flowerpot',
  'ground-chakkar': 'chakkar',
  rockets: 'rocket',
  'aerial-shots': 'aerial',
  'sound-crackers': 'bomb',
  'kids-zone': 'kids',
  'gift-boxes': 'giftbox',
};

export const artForCategory = (slug) => CATEGORY_ART[slug] ?? 'rocket';
