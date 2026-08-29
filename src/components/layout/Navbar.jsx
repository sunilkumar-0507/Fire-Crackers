import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, ShoppingBag } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { NAV_LINKS } from '@/constants';
import { categoriesWithCounts } from '@/data';
import { useScrolled } from '@/hooks/useScrolled';
import { useCartStore, selectCount } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import Logo from '@/components/ui/Logo';
import AnnouncementBar from './AnnouncementBar';

/* -------------------------------------------------------------------------- */

/**
 * Categories as a plain two-column list.
 *
 * No thumbnail: at this size a photograph of a box reads as noise, and the
 * name and tagline already say everything the row is for.
 */
const CategoryPanel = ({ onNavigate }) => (
  <div className="grid w-[min(90vw,560px)] gap-0.5 p-3 sm:grid-cols-2">
    {categoriesWithCounts.map((category) => (
      <Link
        key={category.id}
        to={`/category/${category.slug}`}
        onClick={onNavigate}
        className="group/item block rounded-2xl px-3.5 py-2.5 transition-colors duration-300 hover:bg-secondary-50"
      >
        <span className="flex items-baseline gap-2">
          <span className="truncate text-sm font-semibold text-dark transition-colors group-hover/item:text-primary">
            {category.name}
          </span>
          <span className="shrink-0 text-2xs text-muted">{category.productCount}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted">{category.tagline}</span>
      </Link>
    ))}

    <Link
      to="/products"
      onClick={onNavigate}
      className="col-span-full mt-1 flex items-center justify-between rounded-2xl bg-dark px-5 py-3.5 text-sm font-semibold text-bg transition-colors hover:bg-primary-900"
    >
      Browse the full catalogue
      <span className="text-gold">→</span>
    </Link>
  </div>
);

const NavItem = ({ link, openKey, setOpenKey, onNavigate }) => {
  const hasChildren = Boolean(link.children);
  const isOpen = openKey === link.label;
  const closeTimer = useRef(null);

  const open = () => {
    clearTimeout(closeTimer.current);
    setOpenKey(link.label);
  };
  // Small grace period so a diagonal cursor path into the panel doesn't close it.
  const close = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey((k) => (k === link.label ? null : k)), 140);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? open : undefined}
      onMouseLeave={hasChildren ? close : undefined}
    >
      <NavLink
        to={link.to}
        end={link.to === '/'}
        onClick={onNavigate}
        aria-expanded={hasChildren ? isOpen : undefined}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2.5 text-[15px] font-medium transition-colors duration-200',
            isActive || isOpen ? 'text-primary-700' : 'text-ink hover:text-primary-700',
          )
        }
      >
        {({ isActive }) => (
          <>
            {link.label}
            {hasChildren ? (
              <ChevronDown
                size={14}
                className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
              />
            ) : null}
            <span
              className={cn(
                'absolute inset-x-3 -bottom-0.5 h-[2.5px] origin-left rounded-full bg-primary transition-transform duration-300 ease-luxe',
                isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
              )}
            />
          </>
        )}
      </NavLink>

      {hasChildren && isOpen ? (
        <div
          onMouseEnter={open}
          onMouseLeave={close}
          className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
        >
          <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-lift">
            <CategoryPanel onNavigate={onNavigate} />
          </div>
        </div>
      ) : null}
    </li>
  );
};

/* -------------------------------------------------------------------------- */

export const Navbar = () => {
  const scrolled = useScrolled(28);
  const [openKey, setOpenKey] = useState(null);
  const { pathname } = useLocation();

  const count = useCartStore(selectCount);
  const openCart = useUIStore((s) => s.openCart);
  const openSearch = useUIStore((s) => s.openSearch);
  const openMenu = useUIStore((s) => s.openMenu);

  const closeDropdown = useCallback(() => setOpenKey(null), []);

  // Any route change closes whatever was open.
  useEffect(closeDropdown, [pathname, closeDropdown]);

  // Cmd/Ctrl+K opens search from anywhere, like every catalogue worth using.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* The bar is opaque at every scroll position. It used to be fully
          transparent until 28px, which meant the logo and every nav label sat
          directly on whatever the page happened to be showing underneath —
          legible over the hero, unreadable over a product image. */}
      <div className={cn('relative bg-card', scrolled && 'shadow-soft')}>
        <div
          className={cn(
            'container flex items-center gap-2 sm:gap-4',
            // `h-nav` is the CSS var the shell also reserves as top padding, so
            // the bar and the content offset can never disagree.
            scrolled ? 'h-14 sm:h-16' : 'h-nav',
          )}
        >
          <Logo className="shrink-0" onClick={closeDropdown} />

          {/* `flex-1` on both the nav and nothing else keeps the links optically
              centred between an unequal logo and action cluster. */}
          <nav aria-label="Primary" className="hidden flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <NavItem
                  key={link.label}
                  link={link}
                  openKey={openKey}
                  setOpenKey={setOpenKey}
                  onNavigate={closeDropdown}
                />
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2 lg:ml-0">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search crackers"
              className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-secondary-50 hover:text-primary-700 active:scale-95"
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
              className="relative flex h-11 items-center gap-2 rounded-full bg-flame px-3.5 text-sm font-semibold text-dark transition-[filter] duration-200 hover:brightness-[1.04] active:scale-95 sm:px-4"
            >
              <ShoppingBag size={18} />
            <span className="hidden sm:inline">Cart</span>
              {count > 0 ? (
                <span
                  key={count}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-dark px-1 text-[10px] font-bold text-bg"
                >
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={openMenu}
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-secondary-50 hover:text-primary-700 active:scale-95 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      <AnnouncementBar />
    </header>
  );
};

export default Navbar;
