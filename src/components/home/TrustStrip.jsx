import { Factory, ShieldCheck, Truck, Award } from '@/components/ui/icons';
import { TRUST_POINTS } from '@/constants';

const ICONS = [Factory, ShieldCheck, Truck, Award];

export const TrustStrip = () => (
  <section className="relative pb-4 pt-2">
    <div className="container">
      <ul
        className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
      >
        {TRUST_POINTS.map((point, i) => {
          const Icon = ICONS[i] ?? ShieldCheck;
          return (
            <li key={point.title} className="flex items-start gap-3.5 bg-card p-5 sm:gap-4 sm:p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary-100 text-primary-700 sm:h-11 sm:w-11">
                <Icon size={19} />
              </span>
              <span>
                <span className="block font-display text-base font-semibold text-dark">
                  {point.title}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                  {point.text}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default TrustStrip;
