import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useParallax } from '@/hooks/useParallax';
import { pageTransition } from '@/animations/variants';
import GlowBackdrop from '@/components/fx/GlowBackdrop';
import AmbientCanvas from '@/components/fx/AmbientCanvas';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import SearchOverlay from '@/components/layout/SearchOverlay';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import ScrollManager from '@/components/layout/ScrollManager';
import ScrollToTopButton from '@/components/layout/ScrollToTopButton';
import CartDrawer from '@/components/cart/CartDrawer';
import QuickView from '@/components/product/QuickView';
import { PageSkeleton } from '@/components/ui/Skeleton';

/**
 * App shell.
 *
 * The pointer-parallax hook writes `--px` / `--py` here, once, and every
 * decorative layer beneath reads them in CSS — one listener and one rAF for
 * the whole site rather than one per parallax element.
 */
export const RootLayout = () => {
  const parallaxRef = useParallax();
  const { pathname } = useLocation();

  return (
    <div ref={parallaxRef} className="relative flex min-h-screen flex-col">
      <GlowBackdrop />
      <AmbientCanvas />
      <ScrollManager />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-dark focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>

      <Navbar />

      {/* pt-header clears the fixed announcement strip + navbar */}
      <main id="main" className="flex-1 pt-header">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={pathname} {...pageTransition}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* overlays */}
      <MobileMenu />
      <SearchOverlay />
      <CartDrawer />
      <QuickView />
      <MobileBottomBar />
      <ScrollToTopButton />
    </div>
  );
};

export default RootLayout;
