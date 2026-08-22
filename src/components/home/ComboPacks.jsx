import { ArrowRight, Sparkles } from '@/components/ui/icons';
import { featuredCombos } from '@/data';
import Section, { SectionHeading } from '@/components/ui/Section';
import ComboCard from '@/components/combo/ComboCard';
import Button from '@/components/ui/Button';

export const ComboPacks = () => (
  <Section id="combos" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
    <div className="container">
      <SectionHeading
        eyebrow="Quick purchase"
        icon={<Sparkles size={13} />}
        title="Ready-made festival packages"
        description="Curated bundles, one tap to fill your cart. Adjust any quantity afterwards — nothing is locked."
        action={
          <Button to="/combos" variant="outline" rightIcon={<ArrowRight size={16} />}>
            All combo packs
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {featuredCombos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
      </div>
    </div>
  </Section>
);

export default ComboPacks;
