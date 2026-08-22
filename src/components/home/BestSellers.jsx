import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, FreeMode, Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Flame } from '@/components/ui/icons';
import { bestSellers } from '@/data';
import Section, { SectionHeading } from '@/components/ui/Section';
import ProductCard from '@/components/product/ProductCard';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

/**
 * Best sellers carousel.
 *
 * It advances only when you do — by swipe, by arrow or by dot. It used to
 * autoplay every 3.2 seconds, which moved the row you were reading.
 */
export const BestSellers = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <Section id="best-sellers" className="overflow-hidden">
      <div className="container">
        <SectionHeading
          eyebrow="Best sellers"
          icon={<Flame size={13} />}
          title="The ones that sell out first"
          description="Ranked by what actually left the warehouse last season. If you are buying blind, buy from here."
          action={
            /* Redundant next to a swipe, and they cost a row of height on a
               phone — arrows are for pointers. */
            <div className="hidden gap-2 [@media(pointer:fine)]:flex">
              <button
                ref={prevRef}
                type="button"
                aria-label="Previous products"
                className="grid h-12 w-12 place-items-center rounded-full border border-line bg-card text-primary shadow-soft backdrop-blur transition-all duration-300 hover:-translate-x-0.5 hover:bg-card hover:shadow-lift active:scale-90"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                ref={nextRef}
                type="button"
                aria-label="Next products"
                className="grid h-12 w-12 place-items-center rounded-full border border-line bg-card text-primary shadow-soft backdrop-blur transition-all duration-300 hover:translate-x-0.5 hover:bg-card hover:shadow-lift active:scale-90"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          }
        />
      </div>

      {/* Full-bleed track so slides can run off the right edge of the viewport. */}
      <div className="container">
        <Swiper
          modules={[Navigation, Pagination, FreeMode, A11y]}
          spaceBetween={20}
          slidesPerView={1.15}
          grabCursor
          watchSlidesProgress
          speed={400}
          loop={bestSellers.length > 4}
          pagination={{ clickable: true, el: '.bestseller-dots' }}
          onBeforeInit={(swiper) => {
            // Refs are not populated when Swiper reads its params, so wire the
            // custom arrows up here instead of via the `navigation` option.
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{ prevEl: null, nextEl: null }}
          breakpoints={{
            480: { slidesPerView: 1.6, spaceBetween: 20 },
            768: { slidesPerView: 2.4, spaceBetween: 22 },
            1024: { slidesPerView: 3.2, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="!overflow-visible"
        >
          {bestSellers.map((product) => (
            <SwiperSlide key={product.id} className="h-auto pb-2">
              <ProductCard product={product} compact />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="bestseller-dots mt-8 flex items-center justify-center gap-2 sm:mt-10" />
      </div>
    </Section>
  );
};

export default BestSellers;
