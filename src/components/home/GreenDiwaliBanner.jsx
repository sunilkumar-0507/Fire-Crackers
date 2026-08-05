import { motion } from 'framer-motion';
import { ArrowRight, Leaf, VolumeX } from 'lucide-react';
import { banners, products } from '@/data';
import { fadeUp, inView, slideRight } from '@/animations/variants';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';

const banner = banners.find((b) => b.placement === 'mid');

const SILENT_TAGS = ['silent', 'kids-safe'];
const silentCount = products.filter((p) => p.tags.some((t) => SILENT_TAGS.includes(t))).length;

export const GreenDiwaliBanner = () => (
  <section className="py-6 sm:py-12">
    <div className="container">
      <motion.div
        variants={fadeUp}
        {...inView}
        className="relative grid overflow-hidden rounded-[2.5rem] border border-line bg-white/85 shadow-card lg:grid-cols-2"
      >
        {/* copy */}
        <div className="relative z-10 p-6 sm:p-12 lg:p-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-2xs font-semibold uppercase tracking-[.18em] text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <Leaf size={13} strokeWidth={2.4} />
            {banner.eyebrow}
          </span>

          <h2 className="mt-6 font-display text-display-sm font-semibold text-dark">
            {banner.title}
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{banner.subtitle}</p>

          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-5 sm:mt-8 sm:gap-x-10">
            <div>
              <dd className="font-display text-2xl font-semibold text-dark sm:text-3xl">{silentCount}</dd>
              <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">Quiet products</dt>
            </div>
            <div>
              <dd className="font-display text-2xl font-semibold text-dark sm:text-3xl">0 dB</dd>
              <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">Reports in the range</dt>
            </div>
            <div>
              <dd className="font-display text-2xl font-semibold text-dark sm:text-3xl">15%</dd>
              <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">Extra off with SILENT15</dt>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:mt-9">
            <Button to={banner.ctaPrimary.to} rightIcon={<ArrowRight size={17} />}>
              {banner.ctaPrimary.label}
            </Button>
            <Button to="/combo/silent-celebration-pack" variant="outline" leftIcon={<VolumeX size={16} />}>
              Silent combo pack
            </Button>
          </div>
        </div>

        {/* art panel */}
        <motion.div
          variants={slideRight}
          className="relative min-h-[220px] overflow-hidden sm:min-h-[280px] lg:min-h-full"
          style={{ background: `linear-gradient(140deg, ${banner.accent}22, ${banner.accentTo}33)` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(70% 70% at 60% 40%, rgba(255,213,106,.45), transparent 70%)',
            }}
          />
          {[
            { type: 'sparkler', variant: 4, className: 'left-[8%] top-[12%] h-32 w-32 sm:h-40 sm:w-40', d: 4 },
            { type: 'flowerpot', variant: 4, className: 'right-[10%] top-[26%] h-28 w-28 sm:h-36 sm:w-36', d: 6.5 },
            { type: 'kids', variant: 2, className: 'left-[22%] bottom-[8%] h-28 w-28 sm:h-36 sm:w-36', d: 5.5 },
          ].map((art, i) => (
            <div
              key={i}
              className={`absolute ${art.className} animate-float-slow`}
              style={{ animationDuration: `${art.d + 4}s`, animationDelay: `${i * 0.7}s` }}
            >
              <CrackerArt type={art.type} variant={art.variant} className="h-full w-full" />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default GreenDiwaliBanner;
