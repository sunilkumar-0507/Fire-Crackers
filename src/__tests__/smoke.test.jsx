/**
 * Mount smoke test.
 *
 * Renders the real app against every route and asserts it commits without
 * throwing and without logging a React error. This is the cheapest guard
 * against the failure mode that matters most here — a page that builds fine
 * and then blanks the screen at runtime.
 */
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Category from '@/pages/Category';
import Offers from '@/pages/Offers';
import Combos from '@/pages/Combos';
import ComboDetail from '@/pages/ComboDetail';
import BulkOrders from '@/pages/BulkOrders';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Checkout from '@/pages/Checkout';
import NotFound from '@/pages/NotFound';

const routes = [
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
      { path: '*', element: <NotFound /> },
    ],
  },
];

const PATHS = [
  '/',
  '/products',
  '/products?q=rocket&tag=silent&sort=price-asc',
  '/product/royal-gold-sparkler-30cm',
  '/product/does-not-exist',
  '/category/sparklers',
  '/category/nope',
  '/offers',
  '/combos',
  '/combo/family-festival-box',
  '/bulk-orders',
  '/about',
  '/contact',
  '/checkout',
  '/definitely/not/a/page',
];

beforeAll(() => {
  // Tells React that `act()` is legitimate here rather than a stray call.
  global.IS_REACT_ACT_ENVIRONMENT = true;

  // jsdom ships none of these; the app guards on them but still calls them.
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
  window.scrollTo = () => {};
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });
  HTMLCanvasElement.prototype.getContext = () => ({
    globalAlpha: 1,
    fillStyle: '',
    setTransform() {}, clearRect() {}, beginPath() {}, arc() {}, fill() {},
    fillRect() {}, drawImage() {}, save() {}, restore() {},
    createRadialGradient: () => ({ addColorStop() {} }),
  });
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('every route mounts', () => {
  it.each(PATHS)('renders %s without crashing', async (path) => {
    const errors = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args.map(String).join(' '));
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const router = createMemoryRouter(routes, { initialEntries: [path] });

    await act(async () => {
      root.render(
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>,
      );
    });

    expect(container.textContent.length).toBeGreaterThan(50);
    expect(errors, `console.error during ${path}:\n${errors.join('\n')}`).toEqual([]);

    await act(async () => root.unmount());
    container.remove();
    spy.mockRestore();
  });
});
