import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Copy, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPrice, resolveDeadline } from '@/utils/format';
import { fadeUp } from '@/animations/variants';
import CrackerArt from '@/components/ui/CrackerArt';
import Countdown from './Countdown';

/**
 * Festival offer card: ribbon, countdown and a one-click coupon copy.
 *
 * `featured` renders the wide dark treatment used for the headline offer;
 * everything else uses the compact light card.
 */
export const OfferCard = ({ offer, featured = false, className }) => {
  const [copied, setCopied] = useState(false);
  const deadline = resolveDeadline(offer);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(offer.code);
      setCopied(true);
      toast.success(`${offer.code} copied — paste it in your basket`);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast(`Use code ${offer.code} at checkout`, { icon: '🎟️' });
    }
  };

  const value =
    offer.type === 'percentage'
      ? `${offer.value}% off`
      : offer.type === 'flat'
        ? `${formatPrice(offer.value)} off`
        : 'Free delivery';

  return (
    <motion.article
      variants={fadeUp}
      className={cn(
        'border-glow group relative flex flex-col overflow-hidden rounded-4xl p-5 sm:p-8',
        featured ? 'text-bg' : 'border border-line bg-white text-ink shadow-card',
        className,
      )}
      style={
        featured
          ? { background: `linear-gradient(135deg, ${offer.accent} 0%, ${offer.accentTo} 100%)` }
          : undefined
      }
    >
      {/* animated ribbon */}
      <div className="pointer-events-none absolute -right-14 top-7 z-10 rotate-45">
        <div
          className={cn(
            'relative overflow-hidden px-14 py-1.5 text-2xs font-bold uppercase tracking-[.18em] shadow-lg',
            featured ? 'bg-dark text-gold' : 'bg-flame text-white',
          )}
        >
          {offer.badge}
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gold-sheen" />
        </div>
      </div>

      {/* backdrop art */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute transition-transform duration-[900ms] ease-luxe group-hover:scale-110 group-hover:-rotate-6',
          featured ? '-bottom-8 -left-8 h-52 w-52 opacity-25' : '-bottom-10 -right-6 h-40 w-40 opacity-[.14]',
        )}
      >
        <CrackerArt type={offer.art} variant={featured ? 4 : 1} className="h-full w-full" />
      </div>

      <div className="relative flex flex-1 flex-col">
        <p
          className={cn(
            'text-2xs font-semibold uppercase tracking-[.2em]',
            featured ? 'text-white/70' : 'text-primary/70',
          )}
        >
          {offer.subtitle}
        </p>

        <h3
          className={cn(
            'mt-3 max-w-[calc(100%-3rem)] font-display font-semibold leading-tight sm:max-w-none',
            featured ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl',
          )}
        >
          {offer.title}
        </h3>

        <p
          className={cn(
            'mt-3 max-w-md text-[14px] leading-relaxed',
            featured ? 'text-white/75' : 'text-muted',
          )}
        >
          {offer.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <div>
            <p
              className={cn(
                'mb-2 text-[9px] font-semibold uppercase tracking-[.2em]',
                featured ? 'text-white/55' : 'text-muted',
              )}
            >
              Ends in
            </p>
            <Countdown deadline={deadline} tone={featured ? 'dark' : 'light'} />
          </div>

          <div className="ml-auto text-right">
            <p className={cn('font-display text-2xl font-semibold', featured ? 'text-gold' : 'text-primary')}>
              {value}
            </p>
            {offer.minOrder > 0 ? (
              <p className={cn('mt-1 text-2xs', featured ? 'text-white/55' : 'text-muted')}>
                Above {formatPrice(offer.minOrder)}
              </p>
            ) : (
              <p className={cn('mt-1 text-2xs', featured ? 'text-white/55' : 'text-muted')}>
                No minimum
              </p>
            )}
          </div>
        </div>

        {/* coupon */}
        <button
          type="button"
          onClick={copy}
          className={cn(
            'group/code mt-6 flex items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3.5 transition-all duration-300 sm:mt-7 sm:gap-4 sm:px-5',
            featured
              ? 'border-white/35 bg-white/10 hover:bg-white/20'
              : 'border-secondary-300 bg-secondary-50/70 hover:bg-secondary-50',
          )}
        >
          <span className="flex items-center gap-2.5">
            <Sparkles size={15} className={featured ? 'text-gold' : 'text-primary'} strokeWidth={2.2} />
            <span className={cn('font-mono text-base font-bold tracking-[.14em]', featured ? 'text-bg' : 'text-dark')}>
              {offer.code}
            </span>
          </span>

          <span
            className={cn(
              'flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[.12em]',
              featured ? 'text-white/70' : 'text-primary',
            )}
          >
            {copied ? <Check size={13} strokeWidth={2.6} /> : <Copy size={13} strokeWidth={2.4} />}
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>
    </motion.article>
  );
};

export default OfferCard;
