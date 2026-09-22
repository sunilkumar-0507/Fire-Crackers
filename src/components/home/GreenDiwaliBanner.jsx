import { ArrowRight, Leaf, VolumeX } from '@/components/ui/icons';
import { banners, products, combos } from '@/data';
import { COUPONS } from '@/constants';
import Button from '@/components/ui/Button';

const SILENT_TAGS = ['silent', 'kids-safe'];
const SILENT_COMBO = 'silent-celebration-pack';

/**
 * The silent-range panel.
 *
 * Everything on it now comes from the catalogue at render time. It used to read
 * its banner and its product count at *module load*, which worked only because
 * a full catalogue was bundled with the app — with the data arriving from the
 * API instead, module load is the one moment the catalogue is guaranteed to be
 * empty, and `banners.find(...)` returned undefined and crashed the home page
 * on `banner.eyebrow`.
 *
 * It renders nothing at all rather than rendering hollow: no banner row in the
 * database means the shopkeeper does not want this section, and no silent
 * products means a "Green Diwali" pitch headed by "0 quiet products", which is
 * worse than no pitch.
 */
export const GreenDiwaliBanner = () => {
  const banner = banners.find((b) => b.placement === 'mid');
  if (!banner) return null;

  const silentCount = products.filter((p) =>
    (p.tags ?? []).some((t) => SILENT_TAGS.includes(t)),
  ).length;
  if (!silentCount) return null;

  // The discount is the coupon's own, read from the shop's configuration, so
  // changing SILENT15 in one place changes what this panel promises.
  const silentCoupon = COUPONS.SILENT15;

  // Prefer whatever second action the banner itself carries; fall back to the
  // silent combo, but only while that combo actually exists — a deleted one
  // would otherwise send people to a 404 from the busiest panel on the page.
  const secondary =
    banner.ctaSecondary ??
    (combos.some((c) => c.slug === SILENT_COMBO)
      ? { label: 'Silent combo pack', to: `/combo/${SILENT_COMBO}` }
      : null);

  return (
    <section className="py-6 sm:py-12">
      <div className="container">
        <div className="relative grid overflow-hidden rounded-3xl border border-line bg-card shadow-card sm:rounded-[2.5rem] lg:grid-cols-2">
          {/* copy */}
          <div className="relative z-10 p-5 sm:p-12 lg:p-14">
            {banner.eyebrow ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-2xs font-semibold uppercase tracking-[.18em] text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:px-4 sm:py-2">
                <Leaf size={13} className="shrink-0" />
                {banner.eyebrow}
              </span>
            ) : null}

            <h2 className="mt-5 font-display text-display-sm font-semibold text-dark sm:mt-6">
              {banner.title}
            </h2>

            {banner.subtitle ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:mt-5 sm:text-[15px]">
                {banner.subtitle}
              </p>
            ) : null}

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-5 sm:mt-8 sm:gap-x-10">
              <div>
                <dd className="font-display text-2xl font-semibold text-dark sm:text-3xl">
                  {silentCount}
                </dd>
                <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">
                  Quiet products
                </dt>
              </div>
              <div>
                <dd className="font-display text-2xl font-semibold text-dark sm:text-3xl">0 dB</dd>
                <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">
                  Reports in the range
                </dt>
              </div>
              {silentCoupon ? (
                <div>
                  <dd className="font-display text-2xl font-semibold text-dark sm:text-3xl">
                    {silentCoupon.value}%
                  </dd>
                  <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">
                    Extra off with SILENT15
                  </dt>
                </div>
              ) : null}
            </dl>

            <div className="mt-7 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:mt-9">
              {banner.ctaPrimary ? (
                <Button to={banner.ctaPrimary.to} rightIcon={<ArrowRight size={17} />}>
                  {banner.ctaPrimary.label}
                </Button>
              ) : null}

              {secondary ? (
                <Button to={secondary.to} variant="outline" leftIcon={<VolumeX size={16} />}>
                  {secondary.label}
                </Button>
              ) : null}
            </div>
          </div>

          {/* The panel beside the copy: warm colour, nothing drawn on it. */}
          <div
            className="relative min-h-[180px] overflow-hidden sm:min-h-[280px] lg:min-h-full"
            style={{
              background: `linear-gradient(140deg, ${banner.accent ?? '#E5B23C'}22, ${
                banner.accentTo ?? '#FFD56A'
              }33)`,
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(70% 70% at 60% 40%, rgba(255,213,106,.45), transparent 70%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GreenDiwaliBanner;
