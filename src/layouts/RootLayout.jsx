import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import GlowBackdrop from '@/components/fx/GlowBackdrop';
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
 * Two things that used to live here are gone on purpose:
 *
 *  - **The ambient canvas.** Drifting embers and periodic fireworks behind
 *    every page, forever. Decoration that competes with the product grid.
 *  - **The page-transition wrapper.** Every navigation faded the old route
 *    out and the new one in, which put a few hundred milliseconds of blank
 *    between "I tapped a product" and "I can read the product". Routes now
 *    swap instantly; the browser's own scroll restoration does the rest.
 */
export const RootLayout = () => (
  <div className="relative flex min-h-screen flex-col">
    <GlowBackdrop />
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
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
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

export default RootLayout;
