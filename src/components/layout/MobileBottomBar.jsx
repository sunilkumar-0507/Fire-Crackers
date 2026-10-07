import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Phone, Search, ShoppingBag } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { useCartStore, selectCount } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

/**
 * App-style tab bar for small screens: Home, Products, Search, Contact, Cart.
 *
 * It replaces the floating "view basket" pill, which only appeared once
 * something was in the cart — so a first-time visitor on a phone had no
 * persistent way to reach the catalogue, search or the shop's number. Every
 * one of those is now one thumb-tap away on every page.
 *
 * Search and Cart open their overlays rather than navigating, so they are
 * buttons; the rest are links.
 */

// "Products" stays lit anywhere inside the catalogue, not only on /products.
const isCatalogue = (pathname) =>
  /^\/(products|product\/|category\/|combos|combo\/)/.test(pathname);

const TABS = [
  { label: 'Home', icon: Home, to: '/', match: (p) => p === '/' },
  { label: 'Products', icon: LayoutGrid, to: '/products', match: isCatalogue },
  { label: 'Search', icon: Search, action: 'search' },
  { label: 'Contact', icon: Phone, to: '/contact', match: (p) => p === '/contact' },
  { label: 'Cart', icon: ShoppingBag, action: 'cart' },
];

const tabClass = (active) =>
  cn(
    'relative flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-colors duration-200 active:scale-95',
    active ? 'bg-white/10 text-secondary' : 'text-bg/75 hover:text-bg',
  );

export const MobileBottomBar = () => {
  const { pathname } = useLocation();
  const count = useCartStore(selectCount);
  const cartOpen = useUIStore((s) => s.cartOpen);
  const searchOpen = useUIStore((s) => s.searchOpen);
  const openCart = useUIStore((s) => s.openCart);
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
          {TABS.map(({ label, icon: Icon, to, match, action }) => {
            if (to) {
              const active = match(pathname);
              return (
                <li key={label} className="flex min-w-0 flex-1">
                  <Link to={to} aria-current={active ? 'page' : undefined} className={tabClass(active)}>
                    <Icon size={20} />
                    {label}
                  </Link>
                </li>
              );
            }

            const isCart = action === 'cart';
            const active = isCart ? cartOpen : searchOpen;
            return (
              <li key={label} className="flex min-w-0 flex-1">
                <button
                  type="button"
                  onClick={isCart ? openCart : openSearch}
                  aria-label={isCart ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Search products'}
                  className={tabClass(active)}
                >
                  <span className="relative">
                    <Icon size={20} />
                    {isCart && count > 0 ? (
                      <span
                        key={count}
                        className="absolute -right-3 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-dark"
                      >
                        {count > 99 ? '99+' : count}
                      </span>
                    ) : null}
                  </span>
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
