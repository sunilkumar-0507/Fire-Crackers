import { motion } from 'framer-motion';
import { Check, Factory, Flame, ShieldCheck, Users } from 'lucide-react';
import { BRAND, SAFETY_RULES } from '@/constants';
import { products, categoriesWithCounts } from '@/data';
import { fadeUp, inView, stagger } from '@/animations/variants';
import PageHeader from '@/components/ui/PageHeader';
import Section, { SectionHeading } from '@/components/ui/Section';
import FaqSection from '@/components/home/FaqSection';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';

const TIMELINE = [
  {
    year: '1994',
    title: 'One shed on Sattur Road',
    text: 'R. Gopinath takes a PESO licence and starts making flower pots and chakkars with four workers. The Lakshmi rocket recipe we still use is written this year.',
  },
  {
    year: '2003',
    title: 'The sparkler line',
    text: 'A second shed, and the triple-dip sparkler process that gives our 30cm stick its unbroken sixty-second burn. It has not changed since.',
  },
  {
    year: '2011',
    title: 'Testing brought in-house',
    text: 'We install our own decibel and burn-rate rig rather than sending samples out. Batches that fail never leave the floor — a rule that has cost us a season or two.',
  },
  {
    year: '2018',
    title: 'The silent range',
    text: 'Started after a customer explained why her family had stopped celebrating. It is now a third of everything we make.',
  },
  {
    year: '2026',
    title: 'Direct to your door',
    text: `${products.length} products across ${categoriesWithCounts.length} categories, sold at factory price with no distributor in between.`,
  },
];

const STATS = [
  { icon: Factory, value: '32', label: 'Years on the same floor' },
  { icon: Users, value: '140+', label: 'People on the unit' },
  { icon: Flame, value: `${products.length}`, label: 'Products in the range' },
  { icon: ShieldCheck, value: '100%', label: 'Batches noise-tested' },
];

export const About = () => (
  <>
    <PageHeader
      eyebrow={BRAND.tagline}
      title="Three generations, one factory floor"
      description="We are a Sivakasi manufacturing family that got tired of watching a ₹620 sparkler box reach a customer at ₹620 after leaving our gate at ₹140. So we started selling it ourselves."
      breadcrumbs={[{ label: 'About' }]}
      art="sparkler"
      artVariant={1}
    />

    {/* stats */}
    <div className="container">
      <motion.dl
        variants={stagger(0.06)}
        {...inView}
        className="grid gap-px overflow-hidden rounded-4xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map(({ icon: Icon, value, label }) => (
          <motion.div key={label} variants={fadeUp} className="bg-card px-5 py-6 text-center sm:px-6 sm:py-7">
            <Icon size={20} className="mx-auto text-primary" strokeWidth={2.1} />
            <dd className="mt-3 font-display text-2xl font-semibold text-dark sm:text-3xl">{value}</dd>
            <dt className="mt-1 text-2xs uppercase tracking-[.14em] text-muted">{label}</dt>
          </motion.div>
        ))}
      </motion.dl>
    </div>

    {/* story */}
    <Section>
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div variants={fadeUp} {...inView}>
            <SectionHeading
              eyebrow="Why we sell direct"
              title="The price on the box was never the price"
              description="Printed MRP on fireworks in India assumes three layers of margin: distributor, wholesaler, retail shop. We have none of them. What you pay is what the cracker costs to make, plus a living for the people who made it."
              className="pb-6"
            />
            <p className="text-[15px] leading-[1.8] text-muted">
              Nothing about the product changes. It comes off the same line, in the same batch, as
              the stock that goes to our own shop on Sattur Road. The only difference is that it
              travels to you in one hop instead of four.
            </p>
            <p className="mt-4 text-[15px] leading-[1.8] text-muted">
              We are not the cheapest listing you will find online this month. There are sellers
              who buy failed batches and rebox them. We are not that, and the noise rig in the
              corner of the unit is the reason we can say so.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/products">Browse the catalogue</Button>
              <Button to="/contact" variant="outline">
                Visit the unit
              </Button>
            </div>
          </motion.div>

          {/* timeline */}
          <motion.ol variants={stagger(0.08)} {...inView} className="relative space-y-8 pl-8">
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-secondary-300 via-secondary-200 to-transparent"
            />
            {TIMELINE.map((entry) => (
              <motion.li key={entry.year} variants={fadeUp} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-8 top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 border-secondary-300 bg-bg"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                <p className="font-display text-2xl font-semibold text-primary">{entry.year}</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-dark">{entry.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{entry.text}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </Section>

    {/* safety */}
    <Section id="safety" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <motion.div variants={fadeUp} {...inView}>
            <SectionHeading
              eyebrow="Safety"
              title="Eight rules we would like every customer to read"
              description="Almost every firework injury we hear about comes from breaking one of these. None of them cost anything to follow."
              className="pb-8"
            />
            <div className="relative grid h-56 place-items-center overflow-hidden rounded-4xl border border-line bg-gradient-to-br from-secondary-50 to-white">
              <div className="h-40 w-40 animate-float">
                <CrackerArt type="flowerpot" variant={1} className="h-full w-full" />
              </div>
            </div>
          </motion.div>

          <motion.ul variants={stagger(0.05)} {...inView} className="grid gap-3 sm:grid-cols-2">
            {SAFETY_RULES.map((rule, i) => (
              <motion.li
                key={rule}
                variants={fadeUp}
                className="flex items-start gap-3 rounded-3xl border border-line bg-card p-5 shadow-soft"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-flame text-[11px] font-bold text-dark">
                  {i + 1}
                </span>
                <span className="text-[13px] leading-relaxed text-ink">{rule}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </Section>

    {/* licence */}
    <Section spacing="sm">
      <div className="container">
        <motion.div
          variants={fadeUp}
          {...inView}
          className="flex flex-col items-start gap-6 rounded-4xl border border-line bg-card p-6 shadow-card sm:p-10 lg:flex-row lg:items-center"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={26} strokeWidth={2.1} />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xl font-semibold text-dark">Licensed and compliant</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              {BRAND.licence} · GSTIN {BRAND.gstin}. Every sound-producing item is held under the
              125 dB (AI) ceiling at four metres, as required by PESO and the Supreme Court
              guidelines. We test the batch, not the sample.
            </p>
          </div>
          <ul className="grid gap-2 text-[13px] text-ink">
            {['PESO licensed unit', 'Batch-level dB testing', 'Licensed surface transport'].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Check size={14} className="shrink-0 text-emerald-500" strokeWidth={2.8} />
                {line}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Section>

    <FaqSection />
  </>
);

export default About;
