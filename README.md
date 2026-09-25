# SKV Pyros — premium Diwali cracker storefront

Three projects that meet at one REST API:

| Project | What it is | Port |
| --- | --- | --- |
| `src/` | The public storefront. React 19 + Vite. | 5173 |
| [Fire-Cracker-Admin-](https://github.com/sunilkumar-0507/Fire-Cracker-Admin-) | The shop admin. Its own repository now. | 5174 |
| [Fire_Cracker_API](https://github.com/sunilkumar-0507/Fire_Cracker_API) | ASP.NET Core 10. The only thing the other two share. Its own repository too. | 5080 |

The catalogue is the real 2026 price list — 177 products across 12 categories,
imported from `Final_list_SKV_PYROS_plus10percent.xlsx`.

Paths below that start `api/` are in the Fire_Cracker_API repository.

```bash
npm install                     # the storefront

# the API, run this first — from a checkout of Fire_Cracker_API:
#   dotnet run --project api/GopiCrackers.Api   (:5080)
npm run dev                     # :5173 — the shop

npm run build                   # storefront bundle
npm test                        # 58 storefront tests
npm run lint                    # oxlint, both projects
```

Both dev servers proxy `/api` to port 5080, so there is no origin to configure
and no CORS pre-flight locally.

**With the API stopped the shop still runs** — it falls back to the JSON the
build ships with and says so in a banner. The admin refuses to pretend: it shows
a red bar saying nothing can be saved, because every screen in it exists to write
something.

### Why the admin is a separate project

It used to be lazy-loaded routes under `/admin` in the storefront's own bundle.
It is now a wholly separate application, and the separation buys three things:

- **The shop's bundle contains no admin code at all** — not a chunk a shopper
  merely never requests. `grep X-Admin-Passcode dist/` on the storefront build
  returns nothing.
- **They deploy independently.** The shop can be a public CDN-cached static site
  while the admin sits on an internal host, behind a VPN, or is simply not
  deployed. That is a deployment decision, not a code change.
- **The coupling is a documented HTTP contract** rather than a shared import
  graph. Changing a storefront component cannot break the order book.

They share exactly two things, both deliberate: the REST API, and the product
photography in `src/assets` (one library, globbed by both — see
`src/utils/productPhotos.js` in the admin repository, which keeps its own copy).

### Admin passcode

`Storefront:Admin:Passcode`. **It ships blank**, so a deployment that never sets
it answers every `/api/admin/*` call with a 503 saying exactly that, rather than
leaving the admin quietly open.

| Where | Value |
| --- | --- |
| Local `dotnet run` of the API | `gopi-demo-2026`, from `appsettings.Development.json`. |
| Production | Set `Storefront__Admin__Passcode` on the API host — never in `appsettings.json`, which is committed. See `api/DEPLOYMENT.md`. |

One shared passcode, sent in plain text on every request, with no accounts, no
sessions, no audit trail and no rate limiting. It keeps the admin out of casual
reach on a shop's own network. **It is not authentication** — put something
real in front of it before this is exposed to the internet. The seam to replace
is `Security/AdminOnlyAttribute.cs`.

---

## The 2026 requirements

The fourteen items in `Gopi_Crackers_Developer_Requirements.docx`, and where
each one lives.

| # | Requirement | Where |
| --- | --- | --- |
| 1 | Product search | `utils/search.js`, `SearchOverlay`, `GET /api/search` |
| 2 | Product filter | `FilterPanel` — category, price, tags, availability; all in the URL |
| 3 | Stock / availability | Three states, **derived not stored**: `availabilityOf()` and `Product.Availability` |
| 4 | Product detail view | `pages/ProductDetail.jsx` |
| 5 | Order summary | The checkout's summary rail, re-priced server-side on submit |
| 6 | Reference number | `AC########` orders, `BQ########` enquiries — `OrderStore.NextId` |
| 7 | WhatsApp order / enquiry | `utils/whatsapp.js` — floating button, per-product, whole basket, confirmation |
| 8 | Delivery / pickup | Checkout step 2; `Fulfilment` in the API, which also drops the delivery fee |
| 9 | Order status | Pending → Confirmed → Processing → Ready → Completed, plus `/track` |
| 10 | Admin product management | the admin repo's `src/pages/Products.jsx`, including activate / deactivate |
| 11 | Admin order management | the admin repo's `src/pages/Orders.jsx` and `Enquiries.jsx` |
| 12 | Customer notification | Confirmation screen + WhatsApp; `Services/Notifications.cs` for email |
| 13 | Analytics | `lib/analytics.js` → `AnalyticsStore` → the admin repo's `src/pages/Analytics.jsx` |
| 14 | Policy / information | `constants/policies.js`, rendered at `/policies/:slug` |

### Three rules these share

- **Availability is derived, never typed.** A product is unavailable because the
  shop deactivated it and out of stock because the count reached zero. A badge
  cannot disagree with the number beside it, and the storefront, the API and the
  admin all compute it the same way.
- **The order book is not public.** `GET /api/orders` used to list every
  customer's name, phone number and address to anyone who asked. Tracking now
  requires the reference **and** the phone number it was placed with, returns a
  redacted view, and answers 404 identically for a wrong number and an unknown
  reference — so the difference cannot be used to enumerate orders.
- **Analytics counts visits, not clicks.** The funnel's stages are distinct
  sessions, because "of the people who looked, this many bought" is the only
  sentence those percentages support. One person refreshing a page six times is
  one visit that looked.

### Notifications

The customer's confirmation is the screen they are looking at, the reference
number on it, and the pre-filled WhatsApp message they can send in one tap. None
of that needs a server.

Email is the shop's copy and the customer's receipt, and it is **off unless
configured**. Without `Storefront:Notifications:Smtp:Host`, `LoggingNotificationSender`
logs what it would have sent — an unconfigured deployment must not tell a
customer an email is coming that no relay was ever set up to deliver. Set the
SMTP host and `SmtpNotificationSender` takes over with no other change.

### Analytics, and why there is no cookie banner

Events go to this shop's own API and nowhere else. No third-party tag, no
advertising pixel, no cookie. The only thing that outlives a single event is a
random per-tab id in `sessionStorage`, attached to nothing that identifies a
person — which is why this needs no consent banner.

`order_placed` and `enquiry` are recorded **by the API**, not the browser: a
checkout that navigates away must not be able to lose the one event the shop
actually cares about. The browser passes its session id along with the order so
the API can still attribute it to the visit. Recording it in both places would
double every order and every rupee of revenue in the report.

---

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 (rolldown) + React 19 |
| Styling | Tailwind CSS 3.4, custom festival theme |
| Routing | React Router 7 (`createBrowserRouter`, lazy routes) |
| State | Zustand 5 (cart persisted to `localStorage`) |
| Animation | CSS transitions only — no animation library |
| Carousels | SwiperJS 14 (manual advance, no autoplay) |
| Icons | Themify + Font Awesome 6, via `react-icons` |
| Toasts | react-hot-toast |
| Fonts | Playfair Display + Inter, self-hosted via `@fontsource` |

Fonts are bundled rather than pulled from Google Fonts, so first paint never
waits on a third-party round trip.

---

## Where the data lives

`src/data/index.js` is the **only** module that knows where data comes from,
and `src/data/*.json` is the single source of truth for everything — the shop
reads it, the API serves it, and the admin writes it.

Every page reads `products`, `categories` and friends **synchronously** at
render time. That survives the data being live because of one trick: `main.jsx`
awaits `bootstrap()` before React mounts and swaps the module's exports. They
are ES module *live bindings*, so every importer sees the new arrays on its next
render — no loading state in any of the thirty files that read them.

`src/constants/index.js` works the same way for everything that is not the
catalogue. Brand, shipping thresholds, coupon codes, payment methods, districts,
safety rules, popular searches, trust points and the pickup counter are all
declared there as seeds and then replaced by the API, so adding a coupon in
configuration is enough for the checkout to accept it — there is no second list
in the bundle to keep in step.

```
main.jsx → bootstrap() ─┬→ GET /api/bootstrap       → hydrate()           ─┬→ render
                        ├→ GET /api/meta/config     → hydrateConfig()      │
                        └→ GET /api/meta/fulfilment → hydrateFulfilment()  ┘
                             ↓ any of the three fails
                       keep the bundled seeds, show the offline banner
```

An admin save calls `refresh()`, which fetches the catalogue again.

On the API side, `Services/CatalogStore.cs` is the mirror of that module. Reads
are lock-free against an immutable `CatalogSnapshot`; every write builds a whole
new snapshot, persists the affected part, then swaps it in. In development
`Catalog:DataPath` points at this repo's own `src/data`, so **an admin edit
rewrites the JSON the storefront is built from** and shows up in `git diff`.

Product images are keys into `src/assets/GOPI Crackers`, resolved by
`utils/image.js` and hashed by the bundler. The admin's photo picker chooses
from what the build already ships — adding photography is a commit, not an
upload.

### MySQL, when there is one

The files are the default, not the only option. Set one connection string and
every store — the catalogue, the order book, enquiries, contact messages, the
newsletter list, the stock ledger and analytics — moves to MySQL or MariaDB.
Nothing else changes: the same endpoints, the same responses, the same two
front ends.

```jsonc
// api/GopiCrackers.Api/appsettings.json
"Storefront": {
  "Database": {
    "ConnectionString": "Server=localhost;Port=3306;Database=gopicrackers;User ID=gopi;Password=…;",
    "ServerVersion": "8.0.36-mysql"   // or "10.11.6-mariadb"; blank asks the server
  }
}
```

`ConnectionStrings:GopiCrackers` works too, for hosts that only know how to set
connection strings the standard way — including the `ConnectionStrings__GopiCrackers`
environment variable that Docker and App Service use.

**Blank means files.** That is not a fallback bolted on afterwards; it is the
thing that keeps the 187 API tests running on a machine with no MySQL on it,
and it means the shop can trade before the database exists.

What happens on the first start against an empty database:

```
start ─→ can we reach it? ──no──→ stop, and say which setting to fix
           │ yes
           ├─→ apply pending migrations        (Storefront:Database:AutoMigrate)
           ├─→ any products in the table? ──no──→ seed from src/data/*.json,
           │                                       orders.json and the ledger too
           └─→ load the catalogue into memory, serve requests
```

A configured database that cannot be reached **stops startup** rather than
quietly falling back to files. A shop writing today's orders into a file it
will never look at again is worse than one that refuses to start and says why.

Reads never touch it. The stores load once and answer from memory, exactly as
they did on files — a 177-product catalogue and a season of orders fit in a few
megabytes, so paying a round trip to ask what is on the shelf would buy
nothing. The database is written to, not read from.

Six endpoints cover the rest, all behind the admin passcode:

| | |
| --- | --- |
| `GET /api/admin/database` | Reachable? Which migrations? How many rows in each table? The password is redacted. |
| `GET /api/admin/database/backends` | Which backend each store ended up on. |
| `POST /api/admin/database/migrate` | Applies pending migrations, for a deployment with `AutoMigrate` off. |
| `POST /api/admin/database/seed` | Fills empty tables from the JSON. `{"overwrite": true}` re-imports the catalogue — never orders, the ledger or analytics. |
| `POST /api/admin/database/reload` | Re-reads the catalogue, for rows changed in MySQL directly. |
| `GET /api/admin/database/export` | The whole shop as one JSON document — a backup a person can read. |

With no database configured, `status` says so in a sentence and the two that
need one answer 409. None of them 500s.

Three things are worth knowing about the schema (`api/GopiCrackers.Api/Data/`):

- **Order lines are a child table, product highlights are a JSON column.** The
  split is not aesthetic: sales reporting groups by product id, so
  `order_items` has to be rows. Nothing ever queries across a product's bullet
  points, so they are read and written whole with the product.
- **Every line is priced as it was on the day.** `order_items` copies the name,
  price and MRP rather than pointing at the product, so a November price list
  cannot retroactively rewrite what October's customers were charged.
- **Every timestamp is UTC.** MySQL has no offset-aware type, so a converter in
  `GopiCrackersDbContext` makes that explicit rather than letting the provider
  drop the offset silently.

One difference in behaviour, and it is deliberate. **Bulk enquiries, contact
messages and newsletter addresses are kept in the database and dropped on the
files backend.** The objection was never to storing them — it was to a
permanent plain-text file of names and phone numbers living inside `src/data`,
the folder the storefront is built from and the folder that gets committed. A
database the shop runs, backs up and controls access to is where that record
belongs. Orders are kept either way.

Migrations live in `Data/Migrations` and are generated the usual way:

```bash
cd api/GopiCrackers.Api
dotnet ef migrations add SomeChange --output-dir Data/Migrations
dotnet ef migrations script            # look at the SQL before it runs anywhere
```

`DesignTimeDbContextFactory` means neither command needs a live server.

---

## The admin

`admin/`, its own application on its own port. Deliberately the opposite of the
shop to look at — cool slate and dense tables against the storefront's warm
cream — so two open tabs are never confused for each other. It loads no
storefront CSS, no Playfair, and none of the festival theme.

| Screen | What it does |
| --- | --- |
| Dashboard | Revenue, open orders, stock warnings and enquiries, in one API call |
| Products | Add, edit, delete, **activate / deactivate**; photo picker; tags and flags |
| Stock levels | Whole-catalogue stock take, saved as one request |
| Stock monitor | Intake, sold and holding per product; best sellers; the intake ledger |
| Coupons | The codes checkout accepts and the offer cards the shop shows |
| Combo packs | Pick catalogue items; price, MRP and saving are derived from them |
| Categories | Name, Tamil name, tagline, tone and artwork |
| Orders | The order book, with status transitions and a note per step |
| Enquiries | Bulk quote requests and contact messages |
| Analytics | Views, baskets, searches and the funnel |

Deactivating is not deleting. A parked product keeps its page, its photos and
its history, reads as "temporarily unavailable" to a shopper, and cannot be put
in a basket. Deleting is for a line that is gone for good — and is refused
while a combo still contains it.

### Stock

Three numbers, from three different places, and the point of the screen is that
they agree:

| | Where it comes from |
| --- | --- |
| **Intake** | `stock-intake.json` — a dated line per delivery, recorded in the admin |
| **Sold** | The order book, counting every order that was not cancelled |
| **Holding** | The catalogue's own stock figure |

Placing an order takes its lines off the shelf and cancelling puts them back,
so holding is a live figure rather than whatever somebody last typed. The
ledger is append-only: a miscount or a breakage is corrected with a negative
entry, never by editing history, which is what makes the **Diff** column worth
reading — anything other than zero is stock that arrived before the ledger
existed, or stock that has gone somewhere nobody recorded.

### Coupons

Every row here is a code the checkout will take. `offers.json` is the source,
so a discount created in the admin is redeemable the moment it is saved — these
used to be two separate lists, and an offer could be printed on the offers page
while the till refused it. `Storefront:Coupons` in configuration overrides a
code that has to behave differently from the way it is advertised; `DIWALI75`
is the one that needs it, because the 75% it names is already inside every
catalogue price.

### The analytics screen

Every mark on it is **one hue, light to dark**. There is no categorical palette,
because none of that data's job is identity. The four daily measures are drawn
as small multiples — four charts, four y-scales — rather than four lines
sharing one axis: views run in the hundreds and orders in single figures, and a
dual-axis chart would let any two of them be made to look correlated by choosing
the scales.

Three rules the API enforces rather than the forms:

- **Discount is never typed.** A product's is computed from price against MRP,
  a combo's from the sum of its parts. A badge cannot disagree with the numbers
  beside it.
- **Category counts are counted.** Derived from the catalogue on every snapshot
  build, so a category cannot claim a number its products do not back.
- **Deletes that would break something are refused**, with a sentence saying
  why — a category still holding products, a product still inside a combo.

Orders are written by the storefront checkout and mirrored to
`src/data/orders.json` (gitignored — it is trade, not source), so the order book
survives a restart of both processes.

---

## The hero's fireworks

`components/fx/Fireworks.jsx` runs a particle simulation on a canvas in the
hero's right-hand side. Shells are launched with a velocity, gravity pulls them
back, and each bursts near the top of its arc into sparks that carry their own
momentum, drag and lifetime. Nothing is keyframed, which is why no two go up the
same way and none of them repeat.

A page-wide version of this used to sit behind everything and was removed for
good reasons — body text ended up on a moving coloured field, and a page that
never holds still is tiring to read a price list on. Both were consequences of
*where* it was. This one is bounded to the decorative side and kept off the copy
by a radial mask anchored to the empty top-right corner, so the brightest part
of the animation is always furthest from the headline and the search bar,
whatever the viewport does to the layout underneath. On a phone, where the copy
runs the full width, it is short enough to stop above the body paragraph and
sits behind the headline only — large dark display type with contrast to spare.

It pauses when the hero scrolls away and when the tab is hidden, caps its own
particle count, and does not run at all for a visitor who has asked for reduced
motion — they get the static glyphs the hero used before.

The physics lives in `fireworksSim.js` with no canvas or DOM in it, so the part
worth being sure about is unit-tested rather than eyeballed: that shells really
decelerate, always burst in the upper half and never leave the frame, and that
sparks really spread, slow, fall and burn out.

---

## Photographs, and icons where there is no photograph

Every product carries its own photograph from `src/assets/GOPI Crackers`, and a
test asserts that all 177 resolve — a typo in a filename fails the build rather
than quietly showing the wrong picture.

Everywhere a glyph is wanted instead of a photograph — a category tile, the
decoration behind the hero, the fallback for a row with no photo — the app
draws one icon from `components/ui/icons.jsx`, which re-exports Themify
(`react-icons/tfi`) and Font Awesome 6. `components/ui/ArtIcon.jsx` maps each
cracker type onto its glyph: a rocket is the rocket icon, a gift box the gift
icon. Two icon sets, one file, nothing hand-drawn.

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
- **No animation library.** Decorative motion — reveal-on-scroll, idle
  bobbing, drawer springs, click ripples, carousel autoplay — has been removed.
  What is left is hover/focus colour transitions, the loading spinner and the
  skeleton shimmer, all plain CSS.
- **Deferred filtering.** Search and catalogue filters run through
  `useDeferredValue`, so typing stays responsive while results re-render at
  lower priority. No debounce lag, no dropped keystrokes.
- **Split bundles.** React, the icon set and Swiper are separate chunks; only
  Home is eager, every other route is lazy.
- **Real skeletons, no fake latency.** `MOCK_LATENCY` is `0`. Skeletons appear
  during genuine route loading, not on an artificial timer.
- **`prefers-reduced-motion` is honoured everywhere** — a global rule collapses
  every remaining transition and animation to near-zero duration.

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
├── components/
│   ├── cart/       drawer, checkout stepper
│   ├── combo/      bundle card
│   ├── fx/         splash, ambient canvas, glow backdrop, custom cursor
│   ├── home/       the eleven homepage sections
│   ├── layout/     navbar, mobile menu, search overlay, footer, scroll
│   ├── offers/     offer card, countdown
│   ├── product/    card, grid, gallery, filters, quick view
│   └── ui/         button, badge, modal, tabs, accordion, icons…
├── constants/      brand, nav, coupons, shipping, safety copy
├── data/           the seven catalogue JSON files + the service layer
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

`npm test` — 88 storefront tests, no test-library dependency:

- **`smoke.test.jsx`** mounts the real app at all route shapes — including
  missing products, missing categories, an empty basket and a bad URL — under
  `StrictMode`, and fails on any `console.error`. This is the guard against a
  page that builds fine and then blanks at runtime. Its `IntersectionObserver`
  stub reports every element visible, so the seven `DeferredSection` sections
  below the fold actually mount; with a no-op stub they were invisible to every
  test in the suite.
- **`cart.test.js`** covers line merging, stock caps, delivery thresholds,
  coupon floors, MRP savings and wishlist toggling.
- **`search.test.js`** covers ranking, multi-term narrowing, filter combination
  and sorting — plus catalogue integrity (unique slugs, valid categories, and
  that every stated discount matches its actual price gap).
- **`images.test.js`** asserts every catalogue photo is one the build ships.
- **`carousel.test.js`** pins the best-seller carousel's two competing
  requirements together: it advances on its own, and it stays movable by hand
  and escapable — autoplay survives a swipe, pauses under the pointer, and
  never starts for a reader who asked for reduced motion.
- **`fireworks.test.js`** covers the hero's particle simulation: shells climb,
  decelerate at exactly one gravity per frame, always burst in the upper half
  and never leave the frame; bursts spread in every direction at two speeds in
  one shell colour; sparks slow against drag, turn over into a fall and burn out.
- **`heroMotion.test.jsx`** checks the hero runs the canvas by default and
  falls back to static art for a reader who asked for reduced motion.

`dotnet test api/GopiCrackers.Api.Tests`, in Fire_Cracker_API — the API tests against the real pipeline, booted in-process:
routing, model binding and JSON are all real, nothing is stubbed. They cover the
catalogue and its filters, cart pricing and coupons, the order lifecycle,
analytics, the admin write paths, stock movement and the intake ledger, and the
payment path in its unconfigured state.

Two of the suites are about the database and need no database to run:

- **`DatabaseModelTests`** constructs the `DbContext`, which is where EF builds
  the whole model — so a bad length, a duplicate key or a converter that does
  not apply fails here rather than on somebody's server. It also asserts that
  no indexed column is longer than MySQL can index under utf8mb4, and that a
  product, an order and a banner survive the trip to a row and back with their
  lines, timeline and empty fields intact.
- **`DatabaseEndpointTests`** holds the admin database endpoints to a specific
  promise: with no connection string, every one of them answers usefully.
  Nothing 500s, and the two that genuinely need a database say which setting to
  fill in.

What they cannot prove is that MySQL accepts the SQL — that wants a server.
`dotnet ef migrations script` is the cheapest look at what it would be sent.

---

## Payment

The shop takes cash on delivery and counter pickup out of the box, and nothing
needs configuring for that. Online payment is a Cashfree integration that stays
switched off until credentials exist:

```jsonc
// user-secrets or the environment — never appsettings.json
"Storefront": {
  "Payments": {
    "Cashfree": {
      "Mode": "sandbox",            // or "production"
      "AppId": "…",
      "SecretKey": "…",
      "ReturnUrl": "https://yourshop.example/checkout/payment-return"
    }
  }
}
```

With either credential missing, `DisabledPaymentGateway` is registered instead,
`GET /api/payments/config` answers `enabled: false`, and the checkout offers
only cash on delivery — so the shop cannot show a customer a payment page that
was never going to work.

The flow, once keys are set:

```
POST /api/orders                  the order is real and saved first
  ↓
POST /api/payments/cashfree/session  creates the Cashfree order, returns a session
  ↓
Cashfree's hosted page             the card never touches this site
  ↓
GET  /checkout/payment-return       asks the API what actually happened
POST /api/payments/cashfree/webhook signature checked, then the payment is
                                    re-read from Cashfree rather than believed
```

Two decisions worth keeping if this is ever rewritten. **The order is created
before the payment**, so a customer who abandons the payment page leaves a
booking the shop can ring them about rather than nothing at all. And **the
webhook is treated as a notification, not as evidence** — its signature is
verified, and then the payment status is fetched from Cashfree's API, because
marking an order paid is not a thing to do on somebody else's say-so.

Paid and completed are separate fields on an order (`paymentStatus` against
`status`), because a cash-on-delivery order is completed long before it is paid
and a prepaid one is paid long before it ships.

---

## Accessibility

Focus is trapped and restored in the modal and drawers, Escape closes every
overlay, the search list is arrow-key navigable, there is a skip-to-content
link, breadcrumbs use `aria-current`, decorative icons are `aria-hidden` while
a meaningful one is given a title, and the marquee's duplicated track is
`aria-hidden` so it is not announced twice.

---

## Known notes

- `npm audit` flags a React Router advisory for **RSC-mode CSRF**. This app is
  a client-only SPA with no server and no RSC, so the affected code path does
  not exist here; the only "fix" available is a downgrade, so it stays on
  latest.
- Checkout is a mock. No card, UPI or bank detail is requested, stored or
  transmitted, and `api.placeOrder` resolves locally after a short delay.
