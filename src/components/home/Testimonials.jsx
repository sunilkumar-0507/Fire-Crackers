import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Pagination } from 'swiper/modules';
import { Quote } from 'lucide-react';
import { testimonials } from '@/data';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import Section, { SectionHeading } from '@/components/ui/Section';
import Rating from '@/components/ui/Rating';

import 'swiper/css';
import 'swiper/css/pagination';

const Avatar = ({ person }) => (
  <span
    className="grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-white shadow-soft"
    style={{ background: `linear-gradient(135deg, ${person.accent}, ${person.accent}bb)` }}
    aria-hidden="true"
  >
    {person.initials}
  </span>
);

export const Testimonials = () => {
  const reduced = usePrefersReducedMotion();

  return (
    <Section id="testimonials" className="overflow-hidden">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="From the doorstep"
          title="What people write back"
          description="Unedited notes from orders across Tamil Nadu and Kerala — the good and the mildly critical."
        />

        <Swiper
          modules={[Autoplay, Pagination, A11y]}
          spaceBetween={20}
          slidesPerView={1}
          grabCursor
          loop
          speed={800}
          autoplay={reduced ? false : { delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true, el: '.testimonial-dots' }}
          breakpoints={{
            640: { slidesPerView: 1.6, spaceBetween: 20 },
            900: { slidesPerView: 2.2, spaceBetween: 24 },
            1200: { slidesPerView: 3, spaceBetween: 26 },
          }}
          className="!overflow-visible"
        >
          {testimonials.map((person) => (
            <SwiperSlide key={person.id} className="h-auto pb-2">
              <figure className="glass group relative flex h-full flex-col rounded-4xl p-5 shadow-card transition-shadow duration-500 ease-luxe hover:shadow-lift sm:p-7">
                <Quote
                  size={34}
                  className="absolute right-4 top-4 opacity-[.12] transition-transform duration-700 ease-luxe group-hover:scale-110 sm:right-6 sm:top-6"
                  style={{ color: person.accent }}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <Rating value={person.rating} size="sm" showValue={false} />

                <blockquote className="mt-5 flex-1 text-[15px] leading-[1.75] text-ink/85">
                  “{person.quote}”
                </blockquote>

                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5 sm:mt-7 sm:gap-3.5">
                  <Avatar person={person} />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base font-semibold text-dark">
                      {person.name}
                    </span>
                    <span className="block truncate text-2xs text-muted">
                      {person.role} · {person.location}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="testimonial-dots mt-8 flex items-center justify-center gap-2 sm:mt-10" />
      </div>
    </Section>
  );
};

export default Testimonials;
