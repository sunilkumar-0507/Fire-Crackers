import { Link, useLocation } from 'react-router-dom';
import { Bolt, Home, LayoutGrid, Package, Search } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/store/uiStore';

/**
 * App-style tab bar for small screens: Home, Products, Quick, Search, Bulk Order.
 *
 * It replaces the floating "view basket" pill, which only appeared once
 * something was in the cart — so a first-time visitor on a phone had no
 * persistent way to reach the catalogue, search or the shop's number. Every
 * one of those is now one thumb-tap away on every page.
 *
 * The cart lives in the header's top-right corner instead. Search opens its
 * overlay rather than navigating, so it is a button; the rest are links.
 *
 * Quick sits in the middle as a raised button: it opens the one-page price
 * list, the fastest way to fill a basket on a phone. Contact gave up its slot
 * for it — the shop's number is already the tap-to-call strip at the top of
 * every page on a phone, and WhatsApp floats in the corner.
 */

// "Products" stays lit anywhere inside the catalogue, not only on /products.
const isCatalogue = (pathname) =>
  /^\/(products|product\/|category\/|combos|combo\/)/.test(pathname);

const TABS = [
  { label: 'Home', icon: Home, to: '/', match: (p) => p === '/' },
  { label: 'Products', icon: LayoutGrid, to: '/products', match: isCatalogue },
  { label: 'Quick', icon: Bolt, to: '/quick-order', match: (p) => p === '/quick-order', raised: true },
  { label: 'Search', icon: Search },
  // "Order" drops below 360px, where five full labels no longer fit.
  { label: 'Bulk', suffix: ' Order', icon: Package, to: '/bulk-orders', match: (p) => p === '/bulk-orders' },
];

const tabClass = (active) =>
  cn(
    'relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-colors duration-200 active:scale-95',
    active ? 'bg-white/10 text-secondary' : 'text-bg/75 hover:text-bg',
  );

export const MobileBottomBar = () => {
  const { pathname } = useLocation();
  const searchOpen = useUIStore((s) => s.searchOpen);
  const openSearch = useUIStore((s) => s.openSearch);

  return (
    <>
      {/*
        Reserves the height the fixed bar occupies. A fixed element is out of
        flow, so without this the end of every page — the footer's last links,
        the last row of products — would sit underneath the bar with no way to
        scroll it clear.
      */}
      <div aria-hidden="true" className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden" />

      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-dark px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_24px_-12px_rgba(43,20,8,.45)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-center gap-1">
          {TABS.map(({ label, suffix, icon: Icon, to, match, raised }) => {
            if (raised) {
              const active = match(pathname);
              return (
                <li key={label} className="flex min-w-0 flex-1">
                  <Link
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    aria-label="Quick order"
                    className="flex h-14 min-w-0 flex-1 flex-col items-center justify-end gap-1 text-xs font-semibold text-secondary active:scale-95"
                  >
                    <span
                      className={cn(
                        '-mt-5 grid h-12 w-12 place-items-center rounded-full bg-flame text-dark shadow-glow ring-4 ring-dark transition-transform duration-200',
                        active && 'scale-105',
                      )}
                    >
                      <Icon size={20} />
                    </span>
                    {label}
                  </Link>
                </li>
              );
            }

            if (to) {
              const active = match(pathname);
              return (
                <li key={label} className="flex min-w-0 flex-1">
                  <Link to={to} aria-current={active ? 'page' : undefined} className={tabClass(active)}>
                    <Icon size={20} />
                    <span className="whitespace-nowrap">
                      {label}
                      {suffix ? <span className="max-[359px]:hidden">{suffix}</span> : null}
                    </span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={label} className="flex min-w-0 flex-1">
                <button
                  type="button"
                  onClick={openSearch}
                  aria-label="Search products"
                  className={tabClass(searchOpen)}
                >
                  <Icon size={20} />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default MobileBottomBar;
