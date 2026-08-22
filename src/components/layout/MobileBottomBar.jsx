import { useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from '@/components/ui/icons';
import { useCartTotals } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { formatPrice } from '@/utils/format';

/**
 * Floating cart pill for small screens.
 *
 * Hidden on checkout — a persistent "view cart" button on the page where you
 * are already reviewing the cart is just noise in front of the form.
 */
export const MobileBottomBar = () => {
  const totals = useCartTotals();
  const openCart = useUIStore((s) => s.openCart);
  const { pathname } = useLocation();

  const hidden = pathname.startsWith('/checkout') || totals.count === 0;

  if (hidden) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <button
        type="button"
        onClick={openCart}
        className="flex w-full items-center gap-4 rounded-full bg-dark py-3 pl-3 pr-5 text-left shadow-lift"
      >
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-flame text-dark">
          <ShoppingBag size={18} />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-dark">
            {totals.count}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-2xs uppercase tracking-[.16em] text-gold/80">
            {totals.count} item{totals.count === 1 ? '' : 's'} in basket
          </span>
          <span className="block truncate font-display text-lg font-semibold text-bg">
            {formatPrice(totals.total)}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gold">
          View
          <ArrowRight size={15} />
        </span>
      </button>
    </div>
  );
};

export default MobileBottomBar;
