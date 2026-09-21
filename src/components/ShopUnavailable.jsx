import { BRAND } from '@/constants';

/**
 * What a visitor sees when the shop has no catalogue to show.
 *
 * This screen exists because the bundled fallback catalogue was removed. That
 * fallback made a broken API look like a working shop — same products, same
 * prices, months out of date, and nothing on screen to say so. Showing stale
 * prices to a paying customer is worse than showing none.
 *
 * So the shop says it plainly, and then does the one useful thing left: this
 * business takes a good share of its orders by phone, and that number is
 * hardcoded into the app's configuration rather than fetched. It still works
 * when nothing else does, which makes it the most valuable thing on the page.
 *
 * Deliberately dependency-free beyond BRAND — no router, no catalogue, no
 * shared layout. Everything else on this screen is what might be broken.
 */
export const ShopUnavailable = ({ reason }) => (
  <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-12">
    <div className="w-full max-w-md text-center">
      <p className="font-display text-xl font-semibold text-dark sm:text-2xl">{BRAND.name}</p>
      <p className="mt-1 text-2xs uppercase tracking-[.18em] text-muted">{BRAND.tagline}</p>

      <div className="mt-8 rounded-3xl border border-line bg-card p-6 shadow-card sm:p-8">
        <h1 className="font-display text-xl font-semibold text-dark sm:text-2xl">
          The price list is not loading
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          We could not reach our catalogue just now, so we would rather show you nothing than show
          you last season&rsquo;s prices. It is usually back within a few minutes.
        </p>

        {reason ? (
          // The underlying message, small and muted. A customer will skip it;
          // whoever they forward the screenshot to will not.
          <p className="mt-4 break-words rounded-2xl bg-surface px-4 py-3 text-2xs text-muted">
            {reason}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Try again
          </button>

          <a
            href={BRAND.phoneHref}
            className="inline-flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Call {BRAND.phone}
          </a>
        </div>

        <p className="mt-5 text-2xs text-muted">
          Orders are still being taken on the phone, {BRAND.hours}.
        </p>
      </div>
    </div>
  </main>
);

export default ShopUnavailable;
