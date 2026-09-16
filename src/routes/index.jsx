import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import Home from '@/pages/Home';

/**
 * Route table.
 *
 * Home is imported eagerly so the landing route paints without a Suspense
 * flash. Everything else is lazy, so the first paint carries only what it
 * needs.
 */
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Category = lazy(() => import('@/pages/Category'));
const Offers = lazy(() => import('@/pages/Offers'));
const Combos = lazy(() => import('@/pages/Combos'));
const ComboDetail = lazy(() => import('@/pages/ComboDetail'));
const BulkOrders = lazy(() => import('@/pages/BulkOrders'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const TrackOrder = lazy(() => import('@/pages/TrackOrder'));
const Policy = lazy(() => import('@/pages/Policy'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/*
 * The admin used to live here, at /admin, lazily loaded out of this same
 * bundle. It is now its own Vite application in `admin/`, on its own port,
 * talking to the same API — so there is nothing admin-shaped left in the
 * storefront's build graph at all, rather than a chunk a shopper merely never
 * happens to request.
 */

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'category/:slug', element: <Category /> },
      { path: 'offers', element: <Offers /> },
      { path: 'combos', element: <Combos /> },
      { path: 'combo/:slug', element: <ComboDetail /> },
      { path: 'bulk-orders', element: <BulkOrders /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'track', element: <TrackOrder /> },
      { path: 'policies/:slug', element: <Policy /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
