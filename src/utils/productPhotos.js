/**
 * The real Gopi Crackers product photography.
 *
 * Every file under `src/assets/GOPI Crackers` is picked up here and handed to
 * the bundler, which rewrites each one to a hashed, cache-busted URL. That way
 * a product only ever names the photo it wants — `"GOPI Crackers/ROCKET/Baby
 * Rocket.jfif"` — and never a path that would go stale once the bundle moves.
 */
const files = import.meta.glob('../assets/GOPI Crackers/**/*.{jfif,jpg,jpeg,png,webp}', {
  eager: true,
  // `no-inline` keeps small files out of the JS bundle. Vite would otherwise
  // base64 them as `application/octet-stream` — it has no MIME for `.jfif` —
  // and a browser will not render that in an `<img>`.
  query: '?no-inline',
  import: 'default',
});

/** `"GOPI Crackers/BOMB/Classic Bomb.jfif"` → the built asset URL. */
export const PRODUCT_PHOTOS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace('../assets/', ''), url]),
);

/** The built URL for a catalogue photo key, or `undefined` if we don't ship it. */
export const photoUrl = (key) =>
  typeof key === 'string' ? PRODUCT_PHOTOS[key] : undefined;
