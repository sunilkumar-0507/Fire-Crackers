import { ACCENT_KEYS, accentOf } from '@/constants/accents';
import ArtIcon from '@/components/ui/ArtIcon';

/**
 * The hero's decorative column.
 *
 * Sits with the fireworks canvas on the empty side of the hero and gives it
 * something to happen between bursts: a glow that breathes, three pieces of
 * catalogue art drifting on different cycles, and embers rising off the
 * bottom edge.
 *
 * Everything animates on `transform` and `opacity` only, so the whole layer
 * composites on the GPU and never triggers layout — it can run behind a hero
 * that is also measuring a canvas without costing a frame.
 *
 * `still` renders the same composition with every animation off, which is what
 * the hero passes when the visitor has asked their system for reduced motion.
 * The art stays: the point of that setting is to stop things moving, not to
 * strip the page bare.
 *
 * Sizes are in `vw`-free Tailwind steps and every piece is positioned in
 * percentages, so the composition scales with whatever box the hero gives it
 * rather than needing a breakpoint of its own.
 */

/** x/y are percentages of the layer; `art` keys into ArtIcon. */
const FLOATERS = [
  {
    art: 'rocket',
    className: 'right-[8%] top-[6%] h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32',
    animation: 'animate-drift',
    delay: '0s',
    opacity: 0.85,
  },
  {
    art: 'sparkler',
    className: 'right-[30%] top-[30%] h-12 w-12 sm:h-20 sm:w-20 lg:h-24 lg:w-24',
    animation: 'animate-drift-alt',
    delay: '.8s',
    opacity: 0.7,
  },
  {
    art: 'flowerpot',
    className: 'bottom-[10%] right-[16%] h-12 w-12 sm:h-20 sm:w-20 lg:h-24 lg:w-24',
    animation: 'animate-drift',
    delay: '1.9s',
    opacity: 0.6,
  },
];

/** left %, bottom %, px size, accent index, delay seconds, duration seconds. */
const EMBERS = [
  [22, 4, 4, 0, 0, 6],
  [38, 0, 3, 3, 1.4, 7.5],
  [54, 6, 5, 1, 2.6, 6.8],
  [68, 2, 3, 2, 3.7, 8],
  [84, 8, 4, 4, 4.9, 7],
];

export const HeroAura = ({ still = false }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* The breath behind everything. Warm, low-contrast, and well inside the
        mask the hero applies, so it never reaches the copy. */}
    <div
      className={`absolute right-[6%] top-[8%] h-48 w-48 rounded-full blur-2xl sm:h-64 sm:w-64 lg:h-80 lg:w-80 ${
        still ? 'opacity-40' : 'animate-aura'
      }`}
      style={{
        background:
          'radial-gradient(circle, rgba(255,177,66,.55) 0%, rgba(255,138,0,.28) 45%, transparent 72%)',
      }}
    />

    {/*
      The art, and only from `lg`.

      Below that the copy runs the full width of the hero and there is no free
      column for it to live in — it landed on top of the headline, which is the
      one thing on the page that has to be readable at a glance. The glow above
      stays at every width because a soft blur behind large display type costs
      nothing; solid line art across it costs the sentence.
    */}
    {FLOATERS.map((floater) => (
      <div
        key={floater.art}
        className={`absolute hidden lg:block ${floater.className} ${still ? '' : floater.animation}`}
        style={{
          animationDelay: still ? undefined : floater.delay,
          opacity: floater.opacity,
          // Each piece leans slightly differently even at rest, so the group
          // does not read as three copies of one sticker.
          willChange: still ? undefined : 'transform',
        }}
      >
        <ArtIcon art={floater.art} className="h-full w-full text-primary-700" />
      </div>
    ))}

    {/* Embers, on the same terms as the art above: they rise through the
        space the copy occupies until `lg`. */}
    {still
      ? null
      : EMBERS.map(([left, bottom, size, tone, delay, duration]) => (
          <span
            key={`${left}-${bottom}`}
            className="absolute hidden rounded-full animate-ember lg:block"
            style={{
              left: `${left}%`,
              bottom: `${bottom}%`,
              width: size,
              height: size,
              background: accentOf(ACCENT_KEYS[tone]).hex,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
  </div>
);

export default HeroAura;
