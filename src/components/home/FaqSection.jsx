import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { faqs } from '@/data';
import { BRAND } from '@/constants';
import { fadeUp, inView } from '@/animations/variants';
import Section, { SectionHeading } from '@/components/ui/Section';
import Accordion from '@/components/ui/Accordion';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';

const CATEGORIES = ['All', 'Orders', 'Delivery', 'Safety', 'Products', 'Payments'];

export const FaqSection = ({ limit = null }) => {
  const [category, setCategory] = useState('All');

  const visible = useMemo(() => {
    const filtered = category === 'All' ? faqs : faqs.filter((f) => f.category === category);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [category, limit]);

  return (
    <Section id="faq">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* left rail */}
          <motion.div variants={fadeUp} {...inView} className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Questions"
              title="Everything people ask before ordering"
              description="Delivery windows, noise limits, what children can safely hold, and how the pricing works."
              className="pb-8"
            />

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((name) => (
                <Chip
                  key={name}
                  active={category === name}
                  onClick={() => setCategory(name)}
                  count={name === 'All' ? faqs.length : faqs.filter((f) => f.category === name).length}
                >
                  {name}
                </Chip>
              ))}
            </div>

            <div className="mt-8 rounded-4xl border border-line bg-white/85 p-5 shadow-card sm:mt-10 sm:p-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-flame text-white shadow-glow">
                <MessageCircle size={19} strokeWidth={2.2} />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-dark">
                Still not sure what to order?
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                Call the shop and describe your evening — how many people, how much space, how
                tolerant the neighbours are. We have done this a few thousand times.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={BRAND.phoneHref} size="sm">
                  {BRAND.phone}
                </Button>
                <Button to="/contact" size="sm" variant="outline">
                  Write to us
                </Button>
              </div>
            </div>
          </motion.div>

          {/* accordion */}
          <motion.div variants={fadeUp} {...inView}>
            {/* Remount on filter change so the first answer of each set opens. */}
            <Accordion key={category} items={visible} defaultOpen={visible[0]?.id} />
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

export default FaqSection;
