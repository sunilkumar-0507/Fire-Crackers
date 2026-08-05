import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, Wallet } from 'lucide-react';
import { combos } from '@/data';
import { formatPrice } from '@/utils/format';
import { fadeUp, inView, stagger } from '@/animations/variants';
import PageHeader from '@/components/ui/PageHeader';
import ComboCard from '@/components/combo/ComboCard';
import Chip from '@/components/ui/Chip';
import Section, { SectionHeading } from '@/components/ui/Section';

const BUDGETS = [
  { label: 'Any budget', max: Infinity },
  { label: 'Under ₹1,500', max: 1500 },
  { label: '₹1,500 – ₹3,000', max: 3000, min: 1500 },
  { label: 'Above ₹3,000', min: 3000, max: Infinity },
];

export const Combos = () => {
  const [budget, setBudget] = useState(0);

  const visible = useMemo(() => {
    const rule = BUDGETS[budget];
    return combos.filter(
      (combo) => combo.price <= rule.max && combo.price >= (rule.min ?? 0),
    );
  }, [budget]);

  const totalSaved = combos.reduce((n, c) => n + c.saves, 0);

  return (
    <>
      <PageHeader
        eyebrow="Combo packs"
        title="Boxes we assembled so you don't have to"
        description="Each one is built from what families actually run out of first — heavy on fountains and sparklers, light on the things that end up unlit in the carton on the 3rd of November."
        breadcrumbs={[{ label: 'Combo packs' }]}
        art="giftbox"
        artVariant={1}
        accent="#A6357A"
      >
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((rule, i) => (
            <Chip key={rule.label} active={budget === i} onClick={() => setBudget(i)}>
              {rule.label}
            </Chip>
          ))}
        </div>
      </PageHeader>

      {/* value strip */}
      <div className="container">
        <motion.dl
          variants={stagger(0.06)}
          {...inView}
          className="grid gap-px overflow-hidden rounded-4xl border border-line bg-line sm:grid-cols-3"
        >
          {[
            { icon: Package, value: `${combos.length}`, label: 'Curated boxes' },
            { icon: Wallet, value: formatPrice(totalSaved), label: 'Total saved across the range' },
            { icon: Users, value: '2 – 25', label: 'People served per box' },
          ].map(({ icon: Icon, value, label }) => (
            <motion.div key={label} variants={fadeUp} className="flex items-center gap-3.5 bg-white/85 px-5 py-5 sm:gap-4 sm:px-6 sm:py-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary-50 text-primary sm:h-11 sm:w-11">
                <Icon size={19} strokeWidth={2.1} />
              </span>
              <span className="min-w-0">
                <dd className="font-display text-lg font-semibold text-dark sm:text-xl">{value}</dd>
                <dt className="mt-0.5 text-2xs uppercase tracking-[.14em] text-muted">{label}</dt>
              </span>
            </motion.div>
          ))}
        </motion.dl>
      </div>

      <div className="container py-10 sm:py-14">
        <motion.div
          key={budget}
          variants={stagger(0.07)}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {visible.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </motion.div>
      </div>

      <Section spacing="sm" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
        <div className="container max-w-3xl">
          <SectionHeading
            align="center"
            eyebrow="How we build them"
            title="Nothing in the box is filler"
            description="We pack these from the same stock that goes out as single items, at the same quality. The bundle price is lower because packing forty things once is cheaper than packing them forty times — that saving goes to you, not into a thicker box."
          />
        </div>
      </Section>
    </>
  );
};

export default Combos;
