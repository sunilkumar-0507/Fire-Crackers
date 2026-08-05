import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { COUPONS, SHIPPING, STORAGE_KEYS } from '@/constants';

/**
 * Cart + wishlist. Persisted to localStorage so a refresh never loses a basket.
 *
 * Line items are stored flat and denormalised (name, price, art are copied in)
 * so the cart renders without touching the catalogue — which is exactly what a
 * server-backed cart would return later.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      coupon: null,

      /* ---------------------------------------------------------------- */

      addItem: (item, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);
        const cap = item.stock ?? 99;

        if (existing) {
          const nextQty = Math.min(existing.qty + qty, cap);
          set({
            items: items.map((i) => (i.id === item.id ? { ...i, qty: nextQty } : i)),
          });
          return { added: nextQty - existing.qty, capped: nextQty === cap };
        }

        const nextQty = Math.min(qty, cap);
        set({ items: [...items, { ...item, qty: nextQty }] });
        return { added: nextQty, capped: nextQty === cap };
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      setQty: (id, qty) =>
        set({
          items: get()
            .items.map((i) =>
              i.id === id ? { ...i, qty: Math.max(0, Math.min(qty, i.stock ?? 99)) } : i,
            )
            .filter((i) => i.qty > 0),
        }),

      increment: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (item) get().setQty(id, item.qty + 1);
      },

      decrement: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (item) get().setQty(id, item.qty - 1);
      },

      clearCart: () => set({ items: [], coupon: null }),

      /* ---------------------------------------------------------------- */

      /** Returns a result object rather than throwing — the UI shows the reason. */
      applyCoupon: (rawCode) => {
        const code = (rawCode || '').trim().toUpperCase();
        const rule = COUPONS[code];
        if (!rule) return { ok: false, message: `“${code}” is not a valid code` };

        const subtotal = selectSubtotal(get());
        if (subtotal < rule.minOrder) {
          return {
            ok: false,
            message: `Add ₹${(rule.minOrder - subtotal).toLocaleString('en-IN')} more to use ${code}`,
          };
        }
        set({ coupon: { code, ...rule } });
        return { ok: true, message: rule.note };
      },

      removeCoupon: () => set({ coupon: null }),

      /* ---------------------------------------------------------------- */

      toggleWishlist: (id) => {
        const wishlist = get().wishlist;
        const next = wishlist.includes(id)
          ? wishlist.filter((w) => w !== id)
          : [...wishlist, id];
        set({ wishlist: next });
        return next.includes(id);
      },
    }),
    {
      name: STORAGE_KEYS.cart,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        coupon: state.coupon,
      }),
    },
  ),
);

/* -------------------------------------------------------------------------- */
/* Derived selectors — pass these to useCartStore(selector) so components      */
/* only re-render when the value they actually use changes.                    */
/* -------------------------------------------------------------------------- */

export const selectCount = (s) => s.items.reduce((n, i) => n + i.qty, 0);

export const selectSubtotal = (s) => s.items.reduce((n, i) => n + i.price * i.qty, 0);

export const selectMrpTotal = (s) => s.items.reduce((n, i) => n + (i.mrp ?? i.price) * i.qty, 0);

export const selectInCart = (id) => (s) => s.items.find((i) => i.id === id)?.qty ?? 0;

export const selectIsWishlisted = (id) => (s) => s.wishlist.includes(id);

/**
 * Full money breakdown.
 *
 * Returns a fresh object, so it must never be passed to `useCartStore`
 * directly — React would see a new snapshot on every render and loop. Use the
 * `useCartTotals()` hook below, which shallow-compares the result.
 */
export const selectTotals = (s) => {
  const subtotal = selectSubtotal(s);
  const mrpTotal = selectMrpTotal(s);
  const catalogueSavings = mrpTotal - subtotal;

  let couponDiscount = 0;
  if (s.coupon && subtotal >= s.coupon.minOrder) {
    couponDiscount =
      s.coupon.type === 'percentage'
        ? Math.round((subtotal * s.coupon.value) / 100)
        : Math.min(s.coupon.value, subtotal);
  }

  const afterCoupon = subtotal - couponDiscount;
  const shipping = afterCoupon === 0 || afterCoupon >= SHIPPING.freeAbove ? 0 : SHIPPING.localFee;
  const total = afterCoupon + shipping;

  return {
    subtotal,
    mrpTotal,
    catalogueSavings,
    couponDiscount,
    shipping,
    total,
    totalSavings: catalogueSavings + couponDiscount,
    freeShippingGap: Math.max(0, SHIPPING.freeAbove - afterCoupon),
    count: selectCount(s),
  };
};

/**
 * The money breakdown, shallow-compared.
 *
 * `useShallow` memoises the derived object and only re-renders when one of its
 * numbers actually changes — without it, the fresh object `selectTotals`
 * returns each call makes React's `useSyncExternalStore` re-render forever.
 */
export const useCartTotals = () => useCartStore(useShallow(selectTotals));
