import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { POPULAR_SEARCHES } from '@/constants';
import { bestSellers } from '@/data';
import { searchCategories, searchProducts } from '@/utils/search';
import { formatPrice } from '@/utils/format';
import { artForCategory } from '@/utils/image';
import { useUIStore } from '@/store/uiStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { backdrop, drawerTop, EASE } from '@/animations/variants';
import ProductImage from '@/components/ui/ProductImage';
import CrackerArt from '@/components/ui/CrackerArt';
import Chip from '@/components/ui/Chip';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

const ResultRow = ({ product, active, onSelect, onHover }) => (
  <Link
    to={`/product/${product.slug}`}
    onClick={onSelect}
    onMouseEnter={onHover}
    className={cn(
      'flex items-center gap-3 rounded-2xl p-2.5 transition-colors duration-200 sm:gap-4',
      active ? 'bg-secondary-50' : 'hover:bg-secondary-50/60',
    )}
  >
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-secondary-50 to-white sm:h-14 sm:w-14">
      <ProductImage source={product.images[0]} alt={product.name} className="h-10 w-10 sm:h-12 sm:w-12" />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold text-dark">{product.name}</span>
      <span className="mt-0.5 block truncate text-xs text-muted">{product.unit}</span>
    </span>

    <span className="shrink-0 text-right">
      <span className="block text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
      <span className="block text-2xs text-muted line-through">{formatPrice(product.mrp)}</span>
    </span>

    {/* Decoration only, and there is no hover on touch — drop it there so the
        row keeps the width for the name. */}
    <ArrowRight
      size={16}
      className={cn(
        'hidden shrink-0 text-primary transition-all duration-300 [@media(pointer:fine)]:block',
        active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
      )}
    />
  </Link>
);

/**
 * Full-width search sheet.
 *
 * Filtering runs against the local catalogue on every keystroke. The query is
 * pushed through `useDeferredValue`, so the input stays responsive while the
 * result list re-renders at a lower priority — no debounce lag, no dropped
 * characters. Arrow keys and Enter drive the list, as they should.
 */
export const SearchOverlay = () => {
  const open = useUIStore((s) => s.searchOpen);
  const close = useUIStore((s) => s.closeSearch);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const deferred = useDeferredValue(query);
  const stale = query !== deferred;

  useLockBodyScroll(open);

  const results = useMemo(() => (deferred.trim() ? searchProducts(deferred, 7) : []), [deferred]);
  const matchedCategories = useMemo(
    () => (deferred.trim() ? searchCategories(deferred, 3) : []),
    [deferred],
  );

  useEffect(() => {
    if (!open) return;
    setCursor(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setQuery(''), 250);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  const submit = (value) => {
    const term = (value ?? query).trim();
    close();
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : '/products');
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (!results.length) {
      if (event.key === 'Enter') submit();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      close();
      navigate(`/product/${results[cursor].slug}`);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[95]">
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={close}
            className="absolute inset-0 bg-dark/40 backdrop-blur-md"
          />

          <motion.div
            variants={drawerTop}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="absolute inset-x-0 top-0 max-h-[92svh] overflow-y-auto overscroll-contain rounded-b-[2.5rem] bg-bg/95 shadow-lift backdrop-blur-2xl"
          >
            <div className="container py-6 sm:py-10">
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-2xs font-semibold uppercase tracking-[.24em] text-primary">
                  Search the catalogue
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close search"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-soft transition-transform duration-300 hover:rotate-90 hover:text-primary"
                >
                  <X size={18} strokeWidth={2.4} />
                </button>
              </div>

              {/* input */}
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-px rounded-[1.75rem] bg-flame-soft opacity-0 blur-md transition-opacity duration-500 group-focus-within:opacity-60" />
                <div className="relative flex items-center gap-2.5 rounded-[1.75rem] border border-line bg-white p-1.5 pl-4 shadow-card transition-shadow duration-500 group-focus-within:shadow-lift sm:gap-3 sm:p-2 sm:pl-6">
                  <Search size={20} className="shrink-0 text-primary" strokeWidth={2.2} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setCursor(0);
                    }}
                    onKeyDown={onKeyDown}
                    type="search"
                    placeholder="Search Lakshmi, flower pots, rockets…"
                    aria-label="Search crackers"
                    className="h-12 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted/70 sm:h-14 sm:text-lg"
                  />
                  <Button size="md" onClick={() => submit()} className="hidden shrink-0 sm:inline-flex" rightIcon={<ArrowRight size={16} />}>
                    Search
                  </Button>
                  <Button size="icon" onClick={() => submit()} aria-label="Search" className="shrink-0 sm:hidden">
                    <ArrowRight size={17} />
                  </Button>
                </div>
              </div>

              {/* popular searches */}
              {!deferred.trim() ? (
                <div className="mt-7">
                  <p className="mb-3 text-2xs font-semibold uppercase tracking-[.18em] text-muted">
                    Popular right now
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <Chip key={term} onClick={() => setQuery(term)}>
                        {term}
                      </Chip>
                    ))}
                  </div>

                  <p className="mb-3 mt-8 text-2xs font-semibold uppercase tracking-[.18em] text-muted">
                    Best sellers
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {bestSellers.slice(0, 6).map((product) => (
                      <ResultRow key={product.id} product={product} onSelect={close} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className={cn('mt-7 transition-opacity duration-200', stale && 'opacity-60')}>
                  {matchedCategories.length ? (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {matchedCategories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          onClick={close}
                          className="flex items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink transition-colors hover:border-secondary-300 hover:text-primary"
                        >
                          <span
                            className="grid h-8 w-8 place-items-center rounded-full"
                            style={{ background: category.accentSoft }}
                          >
                            <CrackerArt type={artForCategory(category.slug)} className="h-6 w-6" />
                          </span>
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}

                  {results.length ? (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-2xs font-semibold uppercase tracking-[.18em] text-muted">
                          {results.length} match{results.length === 1 ? '' : 'es'}
                        </p>
                        <span className="hidden items-center gap-1.5 text-2xs text-muted sm:flex">
                          <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans">↑</kbd>
                          <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-sans">↓</kbd>
                          to navigate
                          <kbd className="ml-2 flex items-center gap-1 rounded border border-line bg-white px-1.5 py-0.5 font-sans">
                            <CornerDownLeft size={10} /> open
                          </kbd>
                        </span>
                      </div>

                      <div className="grid gap-1">
                        {results.map((product, index) => (
                          <ResultRow
                            key={product.id}
                            product={product}
                            active={index === cursor}
                            onHover={() => setCursor(index)}
                            onSelect={close}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => submit()}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-secondary-300 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary-50"
                      >
                        See all results for “{deferred}”
                        <ArrowRight size={15} />
                      </button>
                    </>
                  ) : (
                    <EmptyState
                      compact
                      illustration="search"
                      title={`Nothing matched “${deferred}”`}
                      description="Try a shorter word, or browse a category instead — the whole catalogue is only 43 items."
                      action={
                        <Button size="sm" variant="outline" onClick={() => setQuery('')}>
                          Clear search
                        </Button>
                      }
                      secondaryAction={
                        <Button size="sm" to="/products" onClick={close}>
                          Browse all
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="h-[3px] origin-left bg-gradient-to-r from-primary via-secondary-500 to-gold"
            />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default SearchOverlay;
