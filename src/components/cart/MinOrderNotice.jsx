import { AlertTriangle } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/format';
import { meetsMinOrder } from '@/utils/cart';
import { MIN_ORDER_VALUE } from '@/constants';

/**
 * The minimum-order alert. Renders nothing once the basket qualifies, so it
 * can sit unconditionally above any checkout button.
 */
export const MinOrderNotice = ({ subtotal, className }) => {
  if (meetsMinOrder(subtotal)) return null;

  const short = MIN_ORDER_VALUE - subtotal;
  const progress = Math.min(100, Math.round((subtotal / MIN_ORDER_VALUE) * 100));

  return (
    <div
      role="alert"
      className={cn('rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3', className)}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">
            Minimum order is {formatPrice(MIN_ORDER_VALUE)}
          </p>
          <p className="mt-0.5 text-xs text-amber-800">
            Add <span className="font-semibold tabular-nums">{formatPrice(short)}</span> more to
            place your order.
          </p>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-amber-200/70">
        <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default MinOrderNotice;
