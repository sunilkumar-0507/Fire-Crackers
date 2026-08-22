import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Copy, Sparkles } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { accentOf } from '@/constants/accents';
import { formatPrice, resolveDeadline } from '@/utils/format';
import CrackerArt from '@/components/ui/CrackerArt';
import ArtIcon from '@/components/ui/ArtIcon';
import Countdown from './Countdown';

/**
 * Festival offer card: accent tile, countdown and a one-click coupon copy.
 *
 * `featured` renders the wide dark treatment used for the headline offer;
 * everything else uses the compact light card. The dark ground is deliberate —
 * the offer's tone paints the tile, the value and the ribbon, never the surface
 * under the copy, so a saturated hue can never end up behind body text.
 */
export const OfferCard = ({ offer, featured = false, className }) => {
  const [copied, setCopied] = useState(false);
  const deadline = resolveDeadline(offer);
  const accent = accentOf(offer.tone);

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
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-4xl p-5 sm:p-8',
        featured ? 'bg-dark text-bg' : cn('border border-line bg-card text-ink shadow-card', accent.ring),
        className,
      )}
    >
      {/* backdrop art */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute',
          featured ? '-bottom-8 -left-8 h-52 w-52 opacity-25' : '-bottom-10 -right-6 h-40 w-40 opacity-[.14]',
        )}
      >
        <CrackerArt type={offer.art} variant={featured ? 4 : 1} className="h-full w-full" />
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'grid h-12 w-12 shrink-0 place-items-center rounded-2xl',
              accent.tile,
              featured ? null : accent.glow,
            )}
          >
            <ArtIcon art={offer.art} size={22} />
          </span>

          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]',
              featured ? 'bg-white/12 text-gold' : accent.pill,
            )}
          >
            {offer.badge}
          </span>
        </div>

        <p
          className={cn(
            'mt-5 text-2xs font-semibold uppercase tracking-[.2em]',
            featured ? 'text-bg/70' : accent.text,
          )}
        >
          {offer.subtitle}
        </p>

        {/* globals.css paints every h1–h4 `text-dark`, so a heading on a dark
            ground has to name its own colour. */}
        <h3
          className={cn(
            'mt-3 font-display font-semibold leading-tight',
            featured ? 'text-bg text-2xl sm:text-4xl' : 'text-xl sm:text-2xl',
          )}
        >
          {offer.title}
        </h3>

        <p
          className={cn(
            'mt-3 max-w-md text-[14px] leading-relaxed',
            featured ? 'text-bg/75' : 'text-muted',
          )}
        >
          {offer.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <div>
            <p
              className={cn(
                'mb-2 text-[9px] font-semibold uppercase tracking-[.2em]',
                featured ? 'text-bg/55' : 'text-muted',
              )}
            >
              Ends in
            </p>
            <Countdown deadline={deadline} tone={featured ? 'dark' : 'light'} />
          </div>

          <div className="ml-auto text-right">
            <p className={cn('font-display text-2xl font-semibold', featured ? 'text-gold' : accent.text)}>
              {value}
            </p>
            {offer.minOrder > 0 ? (
              <p className={cn('mt-1 text-2xs', featured ? 'text-bg/55' : 'text-muted')}>
                Above {formatPrice(offer.minOrder)}
              </p>
            ) : (
              <p className={cn('mt-1 text-2xs', featured ? 'text-bg/55' : 'text-muted')}>
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
            'mt-6 flex items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3.5 transition-colors duration-200 sm:mt-7 sm:gap-4 sm:px-5',
            featured
              ? 'border-white/35 bg-white/10 hover:bg-white/20'
              : 'border-secondary-300 bg-secondary-50/70 hover:bg-secondary-50',
          )}
        >
          <span className="flex items-center gap-2.5">
            <Sparkles size={15} className={featured ? 'text-gold' : accent.text} />
            <span className={cn('font-mono text-base font-bold tracking-[.14em]', featured ? 'text-bg' : 'text-dark')}>
              {offer.code}
            </span>
          </span>

          <span
            className={cn(
              'flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[.12em]',
              featured ? 'text-bg/70' : accent.text,
            )}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>
    </article>
  );
};

export default OfferCard;
