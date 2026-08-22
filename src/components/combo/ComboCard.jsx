import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, ChevronDown, Package } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { accentOf } from '@/constants/accents';
import { formatPrice } from '@/utils/format';
import { comboToCartItem } from '@/utils/cart';
import { useCartStore, selectInCart } from '@/store/cartStore';
import ArtIcon from '@/components/ui/ArtIcon';

/**
 * Curated bundle card.
 *
 * Reads top to bottom in the order somebody actually decides in: what it is,
 * what is in it, what it costs, add it. The tone comes from the combo's own
 * `tone` key, so the icon tile, the tagline, the discount pill and the CTA all
 * agree — see `constants/accents.js`.
 *
 * The contents list is collapsed to a single wrapping line with a disclosure,
 * rather than a permanently open checklist. Six cards side by side with eight
 * ticked rows each is more list than card.
 */
export const ComboCard = ({ combo, className, showContents = true }) => {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore(selectInCart(combo.id));
  const [open, setOpen] = useState(false);

  const accent = accentOf(combo.tone);
  const items = combo.includes ?? [];
  const preview = items.slice(0, 3);
  const rest = items.length - preview.length;
  const pieces = items.reduce((sum, line) => sum + (line.qty ?? 0), 0);

  const add = (event) => {
    event.preventDefault();
    const { added } = addItem(comboToCartItem(combo), 1);
    if (added > 0) toast.success(`${combo.name} added`);
  };

  return (
    <article className={cn('h-full', className)}>
      <div
        className={cn(
          'flex h-full flex-col rounded-4xl border border-line bg-card p-5 shadow-card transition-colors duration-200 sm:p-6',
          accent.ring,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Icon tile, lit from below by a shadow in the same hue. */}
          <span
            className={cn(
              'grid h-14 w-14 shrink-0 place-items-center rounded-2xl',
              accent.tile,
              accent.glow,
            )}
          >
            <ArtIcon art={combo.art} size={24} />
          </span>

          {combo.badge ? (
            <span
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]',
                accent.pill,
              )}
            >
              {combo.badge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-5 font-display text-xl font-semibold leading-tight text-dark">
          <Link to={`/combo/${combo.slug}`} className="transition-colors hover:text-primary">
            {combo.name}
          </Link>
        </h3>

        <p className={cn('mt-1.5 text-sm font-medium', accent.text)}>{combo.tagline}</p>

        {showContents && items.length ? (
          <div className="mt-4">
            <p className="text-[13px] leading-relaxed text-muted">
              {preview.map((line) => line.name).join(' · ')}
              {rest > 0 ? <span className="font-medium"> + {rest} more items</span> : null}
            </p>

            {rest > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink transition-colors hover:text-primary"
                >
                  See all {items.length} items
                  <ChevronDown size={13} className={cn(open && 'rotate-180')} />
                </button>

                {open ? (
                  <ul className={cn('mt-3 space-y-2 rounded-2xl p-4', accent.wash)}>
                    {items.map((line) => (
                      <li key={line.name} className="flex items-start gap-2.5 text-xs text-ink">
                        <Check size={12} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span className="flex-1">{line.name}</span>
                        <span className="shrink-0 font-semibold text-muted">×{line.qty}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-display text-3xl font-semibold text-dark">
              {formatPrice(combo.price)}
            </span>
            <span className="text-sm text-muted line-through">{formatPrice(combo.mrp)}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-bold',
                accent.pill,
              )}
            >
              {combo.discount}% off
            </span>
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-2xs text-muted">
            <Package size={12} className="shrink-0" />
            {pieces} pieces across {items.length} products
          </p>

          <button
            type="button"
            onClick={add}
            className={cn(
              'mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-colors duration-200 active:scale-[.98]',
              accent.button,
            )}
          >
            {inCart > 0 ? `In basket (${inCart})` : 'Add package to cart'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ComboCard;
