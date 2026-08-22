import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Check, Clock, Package, Users } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format';
import { comboToCartItem } from '@/utils/cart';
import { useCartStore, selectInCart } from '@/store/cartStore';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';

/** Curated bundle card — save flag, contents list and a single clear CTA. */
export const ComboCard = ({ combo, className, showContents = true }) => {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore(selectInCart(combo.id));

  const add = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { added } = addItem(comboToCartItem(combo), 1);
    if (added > 0) toast.success(`${combo.name} added`);
  };

  return (
    <article className={cn('h-full', className)}>
      <div
        data-active={inCart > 0}
        className="border-glow group relative flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-card shadow-card transition-shadow duration-300 ease-luxe hover:shadow-lift"
      >
        {/* save flag */}
        <div className="absolute right-4 top-4 z-10 text-right sm:right-5 sm:top-5">
          <span className="block rounded-2xl bg-dark px-3 py-1.5 text-center shadow-lift sm:px-3.5 sm:py-2">
            <span className="block font-display text-base font-semibold leading-none text-gold">
              {formatPrice(combo.saves)}
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.14em] text-bg/75">
              You save
            </span>
          </span>
        </div>

        {/* art header */}
        <Link
          to={`/combo/${combo.slug}`}
          className="relative grid h-36 place-items-center overflow-hidden sm:h-44"
          style={{ background: `linear-gradient(140deg, ${combo.accent}22, #FFFFFF 60%, ${combo.accent}18)` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-32 opacity-45 transition-opacity duration-700 group-hover:opacity-75"
            style={{ background: `radial-gradient(60% 100% at 50% 100%, ${combo.accent}, transparent 70%)` }}
          />
          <CrackerArt
            type={combo.art}
            variant={2}
            className="relative h-28 w-28 transition-transform duration-400 ease-luxe group-hover:scale-105 sm:h-36 sm:w-36"
          />
          <Badge tone="gold" className="absolute left-4 top-4 max-w-[55%] truncate sm:left-5 sm:top-5">
            {combo.badge}
          </Badge>
        </Link>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold leading-tight text-dark sm:text-xl">
              <Link to={`/combo/${combo.slug}`} className="transition-colors hover:text-primary">
                {combo.name}
              </Link>
            </h3>
          </div>

          <p className="mt-1.5 text-sm italic text-primary">{combo.tagline}</p>
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">
            {combo.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-2xs text-muted">
            <span className="flex items-center gap-1.5">
              <Package size={13} className="text-primary" />
              {combo.itemCount} items
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-primary" />
              {combo.serves}
            </span>
            {combo.duration !== '—' ? (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-primary" />
                {combo.duration}
              </span>
            ) : null}
          </div>

          {showContents ? (
            <ul className="mt-5 space-y-2 rounded-2xl bg-secondary-50/60 p-4">
              {combo.includes.slice(0, 4).map((line) => (
                <li key={line.name} className="flex items-start gap-2.5 text-xs text-ink">
                  <Check size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="flex-1">{line.name}</span>
                  <span className="shrink-0 font-semibold text-muted">×{line.qty}</span>
                </li>
              ))}
              {combo.includes.length > 4 ? (
                <li className="pt-1 text-xs font-semibold text-primary">
                  + {combo.includes.length - 4} more inside
                </li>
              ) : null}
            </ul>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3">
            <Rating value={combo.rating} reviews={combo.reviews} size="xs" />
            <span className="text-2xs text-muted">{combo.stock} left</span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-semibold text-dark">
                  {formatPrice(combo.price)}
                </span>
                <span className="text-xs text-muted line-through">{formatPrice(combo.mrp)}</span>
              </div>
              <p className="mt-1 text-2xs font-semibold text-emerald-600">
                {combo.discount}% off the bundle
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button onClick={add} className="min-w-0 flex-1 px-4 sm:px-6">
              {inCart > 0 ? `In basket (${inCart})` : 'Add to basket'}
            </Button>
            <Button
              to={`/combo/${combo.slug}`}
              variant="outline"
              size="icon"
              aria-label={`View ${combo.name}`}
            >
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ComboCard;
