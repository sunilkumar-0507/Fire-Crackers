import Hero from '@/components/home/Hero';
import CategoryStrip from '@/components/home/CategoryStrip';
import TrustStrip from '@/components/home/TrustStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import OffersSection from '@/components/home/OffersSection';
import BestSellers from '@/components/home/BestSellers';
import GreenDiwaliBanner from '@/components/home/GreenDiwaliBanner';
import ComboPacks from '@/components/home/ComboPacks';
import Testimonials from '@/components/home/Testimonials';
import FaqSection from '@/components/home/FaqSection';
import Newsletter from '@/components/home/Newsletter';
import DeferredSection from '@/components/ui/DeferredSection';

/**
 * Homepage. Ordered as a shopping funnel rather than a feature list: get them
 * searching, show the shelves, prove the price, then remove the last doubts.
 *
 * Only the hero and the trust strip mount eagerly. Everything below is wrapped
 * in `DeferredSection` and mounts as it approaches — the first paint stays
 * cheap, and the two Swiper carousels never initialise until they are needed.
 */
export const Home = () => (
  <>
    <Hero />
    <CategoryStrip />
    <TrustStrip />

    <DeferredSection estimatedHeight={1200}>
      <FeaturedProducts />
    </DeferredSection>

    <DeferredSection estimatedHeight={900}>
      <OffersSection />
    </DeferredSection>

    <DeferredSection estimatedHeight={800}>
      <BestSellers />
    </DeferredSection>

    <DeferredSection estimatedHeight={620}>
      <GreenDiwaliBanner />
    </DeferredSection>

    <DeferredSection estimatedHeight={1000}>
      <ComboPacks />
    </DeferredSection>

    <DeferredSection estimatedHeight={700}>
      <Testimonials />
    </DeferredSection>

    <DeferredSection estimatedHeight={900}>
      <FaqSection limit={6} />
    </DeferredSection>

    <DeferredSection estimatedHeight={520}>
      <Newsletter />
    </DeferredSection>
  </>
);

export default Home;
