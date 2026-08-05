import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Phone, Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { BRAND, NAV_LINKS, SOCIALS } from '@/constants';
import { categoriesWithCounts } from '@/data';
import { artForCategory } from '@/utils/image';
import { useUIStore } from '@/store/uiStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { accordion, backdrop, EASE } from '@/animations/variants';
import CrackerArt from '@/components/ui/CrackerArt';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

const panel = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 34 } },
  exit: { x: '100%', transition: { duration: 0.28, ease: [0.62, 0.05, 0.36, 1] } },
};

const item = {
  hidden: { opacity: 0, x: 28 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.08 + i * 0.045, duration: 0.42, ease: EASE },
  }),
};

export const MobileMenu = () => {
  const open = useUIStore((s) => s.menuOpen);
  const close = useUIStore((s) => s.closeMenu);
  const openSearch = useUIStore((s) => s.openSearch);
  const [expanded, setExpanded] = useState(null);

  useLockBodyScroll(open);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={close}
            className="absolute inset-0 bg-dark/45 backdrop-blur-sm"
          />

          <motion.aside
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,400px)] flex-col bg-bg shadow-lift"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
              <Logo compact onClick={close} scale={0.9} />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-soft transition-transform duration-300 hover:rotate-90 hover:text-primary"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
              <motion.button
                custom={0}
                variants={item}
                initial="hidden"
                animate="show"
                type="button"
                onClick={() => {
                  close();
                  openSearch();
                }}
                className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left text-sm text-muted shadow-soft transition-colors hover:border-secondary-300"
              >
                <Search size={17} className="shrink-0 text-primary" />
                <span className="truncate">Search Lakshmi, flower pots, rockets…</span>
              </motion.button>

              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => {
                  const isExpanded = expanded === link.label;

                  if (!link.children) {
                    return (
                      <motion.li key={link.label} custom={i + 1} variants={item} initial="hidden" animate="show">
                        <NavLink
                          to={link.to}
                          end={link.to === '/'}
                          onClick={close}
                          className={({ isActive }) =>
                            cn(
                              'block rounded-2xl px-4 py-3.5 font-display text-lg font-semibold transition-colors',
                              isActive ? 'bg-secondary-50 text-primary' : 'text-dark hover:bg-secondary-50/70',
                            )
                          }
                        >
                          {link.label}
                        </NavLink>
                      </motion.li>
                    );
                  }

                  return (
                    <motion.li key={link.label} custom={i + 1} variants={item} initial="hidden" animate="show">
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : link.label)}
                        aria-expanded={isExpanded}
                        className={cn(
                          'flex w-full items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg font-semibold transition-colors',
                          isExpanded ? 'bg-secondary-50 text-primary' : 'text-dark hover:bg-secondary-50/70',
                        )}
                      >
                        {link.label}
                        <ChevronDown
                          size={18}
                          className={cn('transition-transform duration-400 ease-luxe', isExpanded && 'rotate-180')}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded ? (
                          <motion.div variants={accordion} initial="collapsed" animate="open" exit="collapsed" className="overflow-hidden">
                            <div className="grid grid-cols-1 gap-2 px-1 pb-3 pt-2 xs:grid-cols-2">
                              {categoriesWithCounts.map((category) => (
                                <Link
                                  key={category.id}
                                  to={`/category/${category.slug}`}
                                  onClick={close}
                                  className="flex items-center gap-2.5 rounded-xl border border-line bg-white/70 p-2.5 transition-colors hover:border-secondary-300"
                                >
                                  <span
                                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                                    style={{ background: category.accentSoft }}
                                  >
                                    <CrackerArt type={artForCategory(category.slug)} className="h-7 w-7" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-semibold text-dark">{category.name}</span>
                                    <span className="block text-2xs text-muted">{category.productCount} items</span>
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-4 border-t border-line bg-white/60 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5">
              <Button to="/bulk-orders" onClick={close} size="md" className="w-full">
                Request a bulk quote
              </Button>

              <a
                href={BRAND.phoneHref}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-ink/75 transition-colors hover:text-primary"
              >
                <Phone size={15} strokeWidth={2.4} />
                {BRAND.phone}
              </a>

              <div className="flex items-center justify-center gap-2 pt-1">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-line bg-white px-3.5 py-1.5 text-2xs font-semibold text-muted transition-colors hover:border-secondary-300 hover:text-primary"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default MobileMenu;
