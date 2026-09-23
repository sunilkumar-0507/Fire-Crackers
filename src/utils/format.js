const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** ₹2,499 */
export const formatPrice = (value) => inr.format(Math.round(value || 0));

/** 2.5K — used in badges and counters where space is tight. */
export const formatCompact = (value) => inrCompact.format(value || 0);

export const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value || 0);

/** Percentage saved between an MRP and the selling price. */
export const discountPercent = (mrp, price) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

/**
 * The three states the brief asks for, plus the two shades of "yes" worth
 * showing a shopper.
 *
 * `state` is the API's vocabulary and the thing to branch on. `key` is finer
 * grained — it separates "only 3 left" from "in stock", which are both
 * available but do not read the same on a card.
 *
 * Derived, never stored: a product is unavailable because the shop deactivated
 * it and out of stock because the count reached zero, so a badge can never
 * disagree with the number beside it. Combos have no `active` flag and fall
 * through to the stock rules, which is correct — a bundle is withdrawn by
 * withdrawing what is in it.
 */
export const AVAILABILITY = {
  available: 'available',
  outOfStock: 'out-of-stock',
  unavailable: 'unavailable',
};

export const availabilityOf = (item) => {
  if (!item) return { key: 'out', state: AVAILABILITY.outOfStock, label: 'Unavailable', purchasable: false };

  const stock = item.stock ?? 0;

  // `active` is absent on anything written before the flag existed, and absent
  // has to mean "on sale" — the alternative is a shop with nothing for sale.
  if (item.active === false) {
    return {
      key: 'unavailable',
      state: AVAILABILITY.unavailable,
      label: 'Temporarily unavailable',
      purchasable: false,
    };
  }

  if (stock <= 0) {
    return { key: 'out', state: AVAILABILITY.outOfStock, label: 'Out of stock', purchasable: false };
  }

  if (stock <= 20) {
    return { key: 'low', state: AVAILABILITY.available, label: `Only ${stock} left`, purchasable: true };
  }

  if (stock <= 60) {
    return { key: 'medium', state: AVAILABILITY.available, label: 'Limited stock', purchasable: true };
  }

  return { key: 'high', state: AVAILABILITY.available, label: 'In stock', purchasable: true };
};

/** True when a customer can actually put this in a basket. */
export const isPurchasable = (item) => availabilityOf(item).purchasable;

export const formatDate = (iso) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  );

/** Adds working days, skipping Sundays — used for the delivery estimate. */
export const addWorkingDays = (days, from = new Date()) => {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) added += 1;
  }
  return date;
};

export const formatDay = (date) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    date,
  );
