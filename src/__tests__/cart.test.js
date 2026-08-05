import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, selectTotals, selectCount } from '@/store/cartStore';
import { toCartItem, comboToCartItem } from '@/utils/cart';
import { findProduct, findCombo } from '@/data';
import { SHIPPING } from '@/constants';

const sparkler = toCartItem(findProduct('royal-gold-sparkler-30cm')); // ₹149, stock 128
const tower = toCartItem(findProduct('giant-fountain-tower')); //        ₹749, stock 19
const combo = comboToCartItem(findCombo('family-festival-box')); //      ₹2499

const reset = () => useCartStore.setState({ items: [], wishlist: [], coupon: null });

describe('cart store', () => {
  beforeEach(reset);

  it('adds an item and merges a repeat add into one line', () => {
    const { addItem } = useCartStore.getState();
    addItem(sparkler, 2);
    addItem(sparkler, 3);

    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(5);
    expect(selectCount(useCartStore.getState())).toBe(5);
  });

  it('never lets quantity exceed available stock', () => {
    const { addItem } = useCartStore.getState();
    const result = addItem(tower, 500);

    expect(useCartStore.getState().items[0].qty).toBe(tower.stock);
    expect(result.capped).toBe(true);
  });

  it('drops a line when its quantity reaches zero', () => {
    const { addItem, setQty } = useCartStore.getState();
    addItem(sparkler, 1);
    setQty(sparkler.id, 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('charges delivery below the free threshold and not above it', () => {
    const { addItem } = useCartStore.getState();
    addItem(sparkler, 1); // ₹149

    let totals = selectTotals(useCartStore.getState());
    expect(totals.subtotal).toBe(149);
    expect(totals.shipping).toBe(SHIPPING.localFee);
    expect(totals.total).toBe(149 + SHIPPING.localFee);

    addItem(combo, 1); // pushes past ₹2,000
    totals = selectTotals(useCartStore.getState());
    expect(totals.shipping).toBe(0);
    expect(totals.freeShippingGap).toBe(0);
  });

  it('rejects a coupon below its minimum order and accepts it above', () => {
    const { addItem, applyCoupon } = useCartStore.getState();
    addItem(sparkler, 1); // ₹149, below EARLYBIRD's ₹1,500 floor

    expect(applyCoupon('EARLYBIRD').ok).toBe(false);
    expect(useCartStore.getState().coupon).toBeNull();

    addItem(combo, 1); // ₹2,648 total
    expect(applyCoupon('EARLYBIRD').ok).toBe(true);

    const totals = selectTotals(useCartStore.getState());
    expect(totals.couponDiscount).toBe(Math.round(totals.subtotal * 0.1));
    expect(totals.total).toBe(totals.subtotal - totals.couponDiscount);
  });

  it('rejects an unknown coupon code', () => {
    expect(useCartStore.getState().applyCoupon('NOTACODE').ok).toBe(false);
  });

  it('reports savings against printed MRP', () => {
    useCartStore.getState().addItem(sparkler, 2);
    const totals = selectTotals(useCartStore.getState());

    expect(totals.mrpTotal).toBe(sparkler.mrp * 2);
    expect(totals.catalogueSavings).toBe((sparkler.mrp - sparkler.price) * 2);
  });

  it('toggles wishlist entries on and off', () => {
    const { toggleWishlist } = useCartStore.getState();
    expect(toggleWishlist('p-001')).toBe(true);
    expect(useCartStore.getState().wishlist).toContain('p-001');
    expect(toggleWishlist('p-001')).toBe(false);
    expect(useCartStore.getState().wishlist).not.toContain('p-001');
  });

  it('clears the basket and the applied coupon together', () => {
    const { addItem, applyCoupon, clearCart } = useCartStore.getState();
    addItem(combo, 1);
    applyCoupon('COMBO500');
    clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.coupon).toBeNull();
  });
});
