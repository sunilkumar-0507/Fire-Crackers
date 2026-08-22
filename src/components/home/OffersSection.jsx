import { ArrowRight } from '@/components/ui/icons';
import { featuredOffers } from '@/data';
import Section, { SectionHeading } from '@/components/ui/Section';
import OfferCard from '@/components/offers/OfferCard';
import Button from '@/components/ui/Button';

export const OffersSection = () => {
  const [headline, ...rest] = featuredOffers;

  return (
    <Section id="offers">
      <div className="container">
        <SectionHeading
          eyebrow="Festival offers"
          title="Stack them while they last"
          description="Coupons apply on top of the catalogue price you already see. Copy a code here and paste it in your basket."
          action={
            <Button to="/offers" variant="outline" rightIcon={<ArrowRight size={16} />}>
              All offers
            </Button>
          }
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {headline ? <OfferCard offer={headline} featured className="lg:row-span-2" /> : null}
          {rest.slice(0, 2).map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default OffersSection;
