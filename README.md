# Gopi Crackers — premium Diwali cracker storefront

A frontend-only, production-shaped React storefront for a Sivakasi fireworks
manufacturer. Every screen runs on local mock JSON; there is no backend, no
authentication and no API integration, and the data layer is arranged so real
endpoints can replace the JSON without touching a single component.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle
npm run test       # 43 tests — route mount smoke, cart maths, search
npm run lint       # oxlint
```

---

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 (rolldown) + React 19 |
| Styling | Tailwind CSS 3.4, custom festival theme |
| Routing | React Router 7 (`createBrowserRouter`, lazy routes) |
| State | Zustand 5 (cart persisted to `localStorage`) |
| Animation | Framer Motion (UI), GSAP (splash timeline), CSS (ambient) |
| Carousels | SwiperJS 14 |
| Icons | Lucide |
| Toasts | react-hot-toast |
| Fonts | Playfair Display + Inter, self-hosted via `@fontsource` |

Fonts are bundled rather than pulled from Google Fonts, so first paint never
waits on a third-party round trip.

---

## Where the data lives

`src/data/index.js` is the **only** module that knows where data comes from.
Components read through it, never from the JSON directly.

```js
// today
import products from './products.json';
export const api = { getProducts: () => settle(products) };

// tomorrow — nothing else in the app changes
export const api = {
  getProducts: () => fetch(`${API_URL}/products`).then((r) => r.json()),
};
```

Every function already returns a promise for exactly that reason. The seven
JSON files are `categories`, `products`, `offers`, `banners`, `combos`,
`testimonials` and `faq`.

Product images are declared as `"images": ["rocket/2", …]`. `utils/image.js`
resolves those to generated vector art today and to `<img>` tags the moment the
strings become URLs — so swapping in real photography is a one-file change.

---

## Illustrations, not photographs

The catalogue ships **no bitmaps**. `components/ui/CrackerArt.jsx` draws all
eight cracker types procedurally as SVG, with four colourways each and a seeded
PRNG so spark positions stay identical across re-renders. It scales to any card
size, weighs nothing, needs no network request and can never show a broken
image icon.

---

## Performance notes

The brief asked that it never feel slow. The decisions that carry that:

- **One canvas, one rAF.** Drifting embers, floating motes and the occasional
  firework all share a single `requestAnimationFrame` loop in `AmbientCanvas`,
  with DPR capped at 1.5, particle count scaled to viewport area, and the loop
  fully stopped when the tab is hidden.
- **No React state on the pointer path.** The custom cursor, card tilt, gallery
  zoom and page parallax all write transforms straight to the DOM inside a rAF.
  A grid of forty tilting cards causes zero re-renders.
- **One parallax listener for the whole site.** `useParallax` publishes `--px` /
  `--py` on the shell; every decorative layer reads them in CSS.
- **Compositor-only animation.** Variants animate `opacity`/`x`/`y`/`scale`
  only — nothing animates width, height, top or left.
- **Deferred filtering.** Search and catalogue filters run through
  `useDeferredValue`, so typing stays responsive while results re-render at
  lower priority. No debounce lag, no dropped keystrokes.
- **Split bundles.** React, Framer Motion, GSAP and Swiper are separate chunks;
  only Home is eager, every other route is lazy.
- **Real skeletons, no fake latency.** `MOCK_LATENCY` is `0`. Skeletons appear
  during genuine route loading, not on an artificial timer.
- **`prefers-reduced-motion` is honoured everywhere** — the splash collapses to
  a fade, carousels stop autoplaying, the cursor and parallax switch off.

---

## The splash screen

`components/fx/SplashScreen.jsx` runs one GSAP timeline: darkness → the diya
catches → embers lift → a spark takes on the fuse → the rocket climbs → it
breaks into a firework → the wordmark resolves → the loader completes → warm
light floods out into the homepage. About 4.1 seconds.

The router mounts *underneath* the splash from the first frame, so the homepage
has already laid out and warmed its fonts when the curtain lifts.

It plays **once per browser session** — a reload in the same tab gets a 500ms
curtain instead, because a four-second gate on every refresh stops being
cinematic somewhere around the third viewing. There is a visible Skip control,
and Escape/Enter/Space skip it too.

---

## Layout

```
src/
├── animations/     Framer Motion variants, shared easings
├── components/
│   ├── cart/       drawer, checkout stepper
│   ├── combo/      bundle card
│   ├── fx/         splash, ambient canvas, glow backdrop, custom cursor
│   ├── home/       the eleven homepage sections
│   ├── layout/     navbar, mobile menu, search overlay, footer, scroll
│   ├── offers/     offer card, countdown
│   ├── product/    card, grid, gallery, filters, quick view
│   └── ui/         button, badge, rating, modal, tabs, accordion, skeleton…
├── constants/      brand, nav, coupons, shipping, safety copy
├── data/           the seven JSON files + the service layer
├── hooks/          media query, scroll, tilt, parallax, countdown, lock-scroll
├── layouts/        RootLayout (app shell)
├── pages/          twelve routes
├── routes/         route table
├── store/          cart (persisted) + UI (transient)
├── styles/         globals.css and design tokens
└── utils/          cn, format, search, image, cart mapping
```

---

## Tests

43 tests, no test-library dependency:

- **`smoke.test.jsx`** mounts the real app at all 15 route shapes — including
  missing products, missing categories, an empty basket and a bad URL — under
  `StrictMode`, and fails on any `console.error`. This is the guard against a
  page that builds fine and then blanks at runtime.
- **`cart.test.js`** covers line merging, stock caps, delivery thresholds,
  coupon floors, MRP savings and wishlist toggling.
- **`search.test.js`** covers ranking, multi-term narrowing, filter combination
  and sorting — plus catalogue integrity (unique slugs, valid categories, and
  that every stated discount matches its actual price gap).

---

## Accessibility

Focus is trapped and restored in the modal and drawers, Escape closes every
overlay, the search list is arrow-key navigable, there is a skip-to-content
link, breadcrumbs use `aria-current`, ratings carry a text alternative, and the
marquee's duplicated track is `aria-hidden` so it is not announced twice.

---

## Known notes

- `npm audit` flags a React Router advisory for **RSC-mode CSRF**. This app is
  a client-only SPA with no server and no RSC, so the affected code path does
  not exist here; the only "fix" available is a downgrade, so it stays on
  latest.
- Checkout is a mock. No card, UPI or bank detail is requested, stored or
  transmitted, and `api.placeOrder` resolves locally after a short delay.
