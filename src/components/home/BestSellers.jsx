import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, FreeMode, Navigation, Pagination } from 'swiper/modules';
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
 * It advances on its own every four seconds, and you can also swipe it, drag
 * it, or use the arrows and dots.
 *
 * Autoplay that cannot be escaped is the failure mode here — a row that moves
 * while you are reading it. So it pauses on hover and on keyboard focus,
 * `disableOnInteraction: false` lets it resume after you have finished rather
 * than dying at the first touch, and anyone who has asked their system for
 * reduced motion never gets it started at all.
 *
 * The reduced-motion preference is read synchronously, on the first render.
 * It used to start `false` and be corrected in an effect, which looked
 * harmless and meant the carousel never moved for anybody: Swiper reads
 * `autoplay` once, when it initialises, so the module registered with
 * `enabled: false` and the later prop change never started it. Hence both
 * halves below — the initial value is right, and a preference that changes
 * while the page is open drives the live instance by hand.
 */

/** Synchronous, and safe to call before the first paint. */
const wantsStillness = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const BestSellers = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const [autoplay, setAutoplay] = useState(() => !wantsStillness());

  // Only for a preference that changes while the page is open. The initial
  // value is already correct above, so there is no `apply()` on mount.
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const wanted = !media.matches;
      setAutoplay(wanted);

      // Re-rendering with a new `autoplay` prop does not start a module that
      // initialised disabled, so say it outright.
      const swiper = swiperRef.current;
      if (!swiper?.autoplay) return;
      if (wanted) swiper.autoplay.start();
      else swiper.autoplay.stop();
    };

    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

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
      <div
        className="container"
        onFocusCapture={(e) => e.currentTarget.swiper?.autoplay?.stop()}
        onBlurCapture={(e) => {
          // Only resume once focus has actually left the carousel, not while it
          // is moving between two cards inside it.
          if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.swiper?.autoplay?.start();
        }}
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // Hang the instance off the container so the focus handlers above
            // can reach it without another ref and another closure.
            if (swiper.el?.parentElement) swiper.el.parentElement.swiper = swiper;
          }}
          modules={[Navigation, Pagination, FreeMode, Autoplay, A11y]}
          spaceBetween={20}
          slidesPerView={1.15}
          grabCursor
          watchSlidesProgress
          speed={400}
          loop={bestSellers.length > 4}
          autoplay={
            autoplay && {
              delay: 4000,
              // Keep advancing after a swipe rather than stopping for good.
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          }

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

        <div className="bestseller-dots mt-6 flex flex-wrap items-center justify-center sm:mt-8" />
      </div>
    </Section>
  );
};

export default BestSellers;
