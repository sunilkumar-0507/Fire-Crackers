import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, Search, ShoppingBag, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import { BRAND, NAV_LINKS } from '@/constants';
import { categoriesWithCounts } from '@/data';
import { artForCategory } from '@/utils/image';
import { useScrolled } from '@/hooks/useScrolled';
import { useCartStore, selectCount } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { dropdown, EASE } from '@/animations/variants';
import Logo from '@/components/ui/Logo';
import CrackerArt from '@/components/ui/CrackerArt';
import AnnouncementBar from './AnnouncementBar';

/* -------------------------------------------------------------------------- */

const CategoryPanel = ({ onNavigate }) => (
  <div className="grid w-[min(90vw,720px)] gap-1.5 p-3 sm:grid-cols-2">
    {categoriesWithCounts.map((category) => (
      <Link
        key={category.id}
        to={`/category/${category.slug}`}
        onClick={onNavigate}
        className="group/item flex items-center gap-3.5 rounded-2xl p-3 transition-colors duration-300 hover:bg-secondary-50"
      >
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-luxe group-hover/item:scale-110"
          style={{ background: `${category.accentSoft}` }}
        >
          <CrackerArt type={artForCategory(category.slug)} variant={1} className="h-9 w-9" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate text-sm font-semibold text-dark transition-colors group-hover/item:text-primary">
              {category.name}
            </span>
            <span className="shrink-0 text-2xs text-muted">{category.productCount}</span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">{category.tagline}</span>
        </span>
      </Link>
    ))}

    <Link
      to="/products"
      onClick={onNavigate}
      className="col-span-full mt-1 flex items-center justify-between rounded-2xl bg-dark px-5 py-3.5 text-sm font-semibold text-bg transition-colors hover:bg-[#3d1708]"
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
            'group relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[14.5px] font-medium transition-colors duration-300',
            isActive || isOpen ? 'text-primary' : 'text-ink/75 hover:text-primary',
          )
        }
      >
        {({ isActive }) => (
          <>
            {link.label}
            {hasChildren ? (
              <ChevronDown
                size={14}
                strokeWidth={2.4}
                className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
              />
            ) : null}
            <span
              className={cn(
                'absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-left rounded-full bg-flame transition-transform duration-400 ease-luxe',
                isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
              )}
            />
          </>
        )}
      </NavLink>

      {hasChildren ? (
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              variants={dropdown}
              initial="hidden"
              animate="show"
              exit="exit"
              onMouseEnter={open}
              onMouseLeave={close}
              className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
            >
              <div className="overflow-hidden rounded-3xl border border-line bg-white/92 shadow-lift backdrop-blur-xl">
                <CategoryPanel onNavigate={onNavigate} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
      <motion.div
        initial={false}
        animate={{ height: scrolled ? 0 : 36, opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="overflow-hidden"
      >
        <AnnouncementBar />
      </motion.div>

      <div
        className={cn(
          'relative transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-luxe',
          scrolled
            ? 'border-b border-line bg-bg/80 shadow-[0_8px_30px_-18px_rgba(120,55,15,.35)] backdrop-blur-xl saturate-150'
            : 'bg-transparent',
        )}
      >
        <div
          className={cn(
            'container flex items-center justify-between gap-2 transition-all duration-500 ease-luxe sm:gap-4',
            // `h-nav` is the CSS var the shell also reserves as top padding, so
            // the bar and the content offset can never disagree.
            scrolled ? 'h-14 sm:h-16' : 'h-nav',
          )}
        >
          <Logo scale={scrolled ? 0.88 : 1} onClick={closeDropdown} />

          <nav aria-label="Primary">
            <ul className="hidden items-center gap-0.5 lg:flex">
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

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <a
              href={BRAND.phoneHref}
              className="hidden items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 text-xs font-semibold text-ink/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary-300 hover:text-primary hover:shadow-soft xl:inline-flex"
            >
              <Phone size={13} strokeWidth={2.4} />
              {BRAND.phone}
            </a>

            <button
              type="button"
              onClick={openSearch}
              aria-label="Search crackers"
              className="grid h-10 w-10 place-items-center rounded-full text-ink/80 transition-all duration-300 hover:bg-secondary-50 hover:text-primary active:scale-90 xs:h-11 xs:w-11"
            >
              <Search size={19} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-ink/80 transition-all duration-300 hover:bg-secondary-50 hover:text-primary active:scale-90 xs:h-11 xs:w-11"
            >
              <ShoppingBag size={19} strokeWidth={2} />
              <AnimatePresence>
                {count > 0 ? (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                    className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-[10px] font-bold text-white shadow-[0_4px_12px_-4px_rgba(200,77,14,.9)]"
                  >
                    {count > 99 ? '99+' : count}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>

            <Link
              to="/bulk-orders"
              className="ml-1 hidden shrink-0 items-center rounded-full bg-flame px-5 py-2.5 text-xs font-semibold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-lg md:inline-flex"
            >
              Bulk orders
            </Link>

            <button
              type="button"
              onClick={openMenu}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full text-ink/80 transition-all duration-300 hover:bg-secondary-50 hover:text-primary active:scale-90 xs:h-11 xs:w-11 lg:hidden"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* hairline that draws in once the bar goes solid */}
        <span
          className={cn(
            'absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-transparent via-secondary-300/60 to-transparent transition-transform duration-700 ease-luxe',
            scrolled ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </div>
    </header>
  );
};

export default Navbar;
