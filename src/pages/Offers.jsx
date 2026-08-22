import { ArrowRight, Check, Info, Tag } from '@/components/ui/icons';
import { offers, combos } from '@/data';
import { formatPrice } from '@/utils/format';
import PageHeader from '@/components/ui/PageHeader';
import Section, { SectionHeading } from '@/components/ui/Section';
import OfferCard from '@/components/offers/OfferCard';
import ComboCard from '@/components/combo/ComboCard';
import Button from '@/components/ui/Button';

export const Offers = () => {
  const [headline, ...rest] = offers;

  return (
    <>
      <PageHeader
        eyebrow="Festival offers"
        title="Every discount, in one place"
        description="The 75% catalogue discount is already in the price you see. Everything below stacks on top of it — copy a code and paste it in your basket."
        breadcrumbs={[{ label: 'Offers' }]}
        art="flowerpot"
        artVariant={1}
      />

      <div className="container pb-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {headline ? <OfferCard offer={headline} featured className="lg:col-span-2" /> : null}
          {rest.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>

      {/* terms */}
      <Section spacing="sm">
        <div className="container">
          <SectionHeading
            eyebrow="The fine print"
            icon={<Info size={13} />}
            title="What each code actually does"
            description="No hidden conditions — this is the whole set of rules the basket applies."
            className="pb-8"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <div key={offer.id} className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold tracking-[.12em] text-dark">
                    {offer.code}
                  </span>
                  <span className="rounded-full bg-secondary-50 px-3 py-1 text-2xs font-semibold text-primary">
                    {offer.type === 'percentage'
                      ? `${offer.value}% off`
                      : offer.type === 'flat'
                        ? `${formatPrice(offer.value)} off`
                        : 'Free shipping'}
                  </span>
                </div>

                <ul className="mt-4 space-y-2.5">
                  {offer.terms.map((term) => (
                    <li key={term} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
                      <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p
            className="mt-8 flex items-start gap-3 rounded-3xl border border-dashed border-secondary-300 bg-secondary-50/60 p-5 text-[13px] leading-relaxed text-ink"
          >
            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
            Only one coupon applies per order — the basket keeps whichever you entered last. The
            catalogue discount is separate and always applies.
          </p>
        </div>
      </Section>

      {/* combos that pair with the offers */}
      <Section spacing="sm" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
        <div className="container">
          <SectionHeading
            eyebrow="Best value with a code"
            icon={<Tag size={13} />}
            title="Where the discounts land hardest"
            description="COMBO500 takes another ₹500 off any of these, on top of the bundle price."
            action={
              <Button to="/combos" variant="outline" rightIcon={<ArrowRight size={16} />}>
                All combo packs
              </Button>
            }
            className="pb-8"
          />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {combos.slice(0, 3).map((combo) => (
              <ComboCard key={combo.id} combo={combo} showContents={false} />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
};

export default Offers;
