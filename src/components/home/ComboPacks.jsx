import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { featuredCombos } from '@/data';
import { inView, stagger } from '@/animations/variants';
import Section, { SectionHeading } from '@/components/ui/Section';
import ComboCard from '@/components/combo/ComboCard';
import Button from '@/components/ui/Button';

export const ComboPacks = () => (
  <Section id="combos" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
    <div className="container">
      <SectionHeading
        eyebrow="Combo packs"
        title="Let somebody else do the deciding"
        description="Each box is assembled from what families actually run out of first, priced below the sum of its parts, and shipped with a printed running order inside the lid."
        action={
          <Button to="/combos" variant="outline" rightIcon={<ArrowRight size={16} />}>
            All combo packs
          </Button>
        }
      />

      <motion.div
        variants={stagger(0.08)}
        {...inView}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {featuredCombos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
      </motion.div>
    </div>
  </Section>
);

export default ComboPacks;
