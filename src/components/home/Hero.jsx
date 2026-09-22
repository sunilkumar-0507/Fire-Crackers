import { ArrowRight, Phone } from '@/components/ui/icons';
import { BRAND } from '@/constants';
import { products, categoriesWithCounts } from '@/data';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import Button from '@/components/ui/Button';
import Fireworks from '@/components/fx/Fireworks';
import fireArt from '@/assets/art/Fire.webp';

/**
 * Landing hero.
 *
 * Copy on the left, the festival still-life on the right — the arrangement in
 * the reference: rocket, flower pot, chakkar, diya and a bundle of crackers
 * around a gift box, cut out on transparency so it sits on the page's cream
 * rather than in a frame.
 *
 * Behind the picture, shells launch and burst on a canvas. The layer is sized
 * to the still-life rather than to the section, so the bursts go off around
 * the picture and never reach the headline — a page-wide version of this
 * canvas was removed once for exactly that reason.
 *
 * Three more things move, each on a different element so they never fight over
 * `transform`:
 *
 *  - the glow behind the art breathes,
 *  - the group rises and fades in once on arrival,
 *  - the art itself drifts, slowly and forever, inside that group.
 *
 * Those three need no reduced-motion branch in JavaScript: globals.css ends
 * with a `prefers-reduced-motion: reduce` block that collapses every animation
 * on the page to a single 0.001ms pass, so each lands on its finished state and
 * then holds still.
 *
 * The canvas is the exception, and the reason this component has a hook at all.
 * That CSS block cannot reach a `requestAnimationFrame` loop, so the only way
 * to honour the setting is not to mount it. `usePrefersReducedMotion` is built
 * on `useSyncExternalStore` with a synchronous snapshot, so it is already
 * correct on the first render rather than a frame late.
 *
 * The picture is imported as `.webp`, not as the `.png` beside it. This is the
 * homepage's largest paint and the PNG is 1.3MB — most of a second on the 3G
 * that a good share of this shop's traffic still arrives on. The WebP is 265KB
 * with the same transparency and no visible difference at any size we draw it.
 * `Fire.png` stays in the repo as the master to re-export from; nothing
 * imports it, so the bundler never emits it.
 */
export const Hero = () => {
  const stillness = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
      <div className="container relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12">
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
            The still-life.

            `order-first` on a phone would push the buttons below the fold, so it
            stays under the copy at every width and simply moves into the second
            column from `lg`.

            The picture is decorative rather than informative: everything it
            says — who we are, what we sell, what it costs — the copy beside it
            already says in words. So it carries an empty `alt` and sits behind
            `aria-hidden`, which keeps a screen reader from announcing a
            description of a photograph nobody needs read aloud.
          */}
          <div aria-hidden="true" className="relative animate-rise-in">
            {/* Shells launching and bursting, behind everything else in this
                column. The box is deliberately larger than the picture so the
                bursts open around it rather than being clipped to its edges;
                the section's `overflow-hidden` trims whatever runs past the
                viewport. */}
            {stillness ? null : (
              <div className="pointer-events-none absolute -inset-x-10 -top-24 bottom-2 mask-hero-fx">
                <Fireworks />
              </div>
            )}

            {/* The warm light it appears to be lit by. Sized off the art's own
                box so the two scale together. */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-glow"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,178,56,.55) 0%, rgba(255,138,0,.22) 45%, transparent 72%)',
              }}
            />

            <img
              src={fireArt}
              alt=""
              width={1254}
              height={1254}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative mx-auto block w-full max-w-sm object-contain animate-float sm:max-w-md lg:max-w-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
