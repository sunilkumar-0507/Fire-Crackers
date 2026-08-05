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

/** "128 in stock" → a coarse band the UI can colour-code. */
export const stockLevel = (stock) => {
  if (stock <= 0) return { key: 'out', label: 'Out of stock' };
  if (stock <= 20) return { key: 'low', label: `Only ${stock} left` };
  if (stock <= 60) return { key: 'medium', label: 'Limited stock' };
  return { key: 'high', label: 'In stock' };
};

/** Splits a countdown in ms into padded day/hour/minute/second parts. */
export const splitDuration = (ms) => {
  const clamped = Math.max(0, ms);
  const total = Math.floor(clamped / 1000);
  return {
    days: String(Math.floor(total / 86400)).padStart(2, '0'),
    hours: String(Math.floor((total % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
    seconds: String(total % 60).padStart(2, '0'),
    expired: clamped <= 0,
  };
};

/**
 * Offers carry a fixed `endsAt`, but a demo should never show a dead timer.
 * Once the fixed date passes we roll forward by `fallbackHours` instead.
 */
export const resolveDeadline = (offer) => {
  const fixed = new Date(offer.endsAt).getTime();
  if (Number.isFinite(fixed) && fixed > Date.now()) return fixed;
  return Date.now() + (offer.fallbackHours ?? 48) * 3600 * 1000;
};

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
