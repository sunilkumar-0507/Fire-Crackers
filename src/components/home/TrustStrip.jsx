import { motion } from 'framer-motion';
import { Factory, ShieldCheck, Truck, Award } from 'lucide-react';
import { TRUST_POINTS } from '@/constants';
import { fadeUp, inView, stagger } from '@/animations/variants';

const ICONS = [Factory, ShieldCheck, Truck, Award];

export const TrustStrip = () => (
  <section className="relative pb-4 pt-2">
    <div className="container">
      <motion.ul
        variants={stagger(0.07)}
        {...inView}
        className="grid gap-px overflow-hidden rounded-4xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
      >
        {TRUST_POINTS.map((point, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <motion.li
              key={point.title}
              variants={fadeUp}
              className="group flex items-start gap-3.5 bg-white/85 p-5 transition-colors duration-500 hover:bg-white sm:gap-4 sm:p-6"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary-50 text-primary transition-all duration-500 ease-luxe group-hover:scale-110 group-hover:bg-flame group-hover:text-white sm:h-11 sm:w-11">
                <Icon size={19} strokeWidth={2.1} />
              </span>
              <span>
                <span className="block font-display text-base font-semibold text-dark">
                  {point.title}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                  {point.text}
                </span>
              </span>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  </section>
);

export default TrustStrip;
