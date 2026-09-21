/**
 * Puts a catalogue in front of the tests.
 *
 * The shop no longer bundles one. `src/data` starts empty and is filled from
 * the API before React mounts, which is right for the product and wrong for a
 * unit test — there is no API here, and a suite that asserted against an empty
 * catalogue would pass while proving nothing.
 *
 * So the tests load the same JSON the API seeds a fresh database from, and push
 * it through the real `hydrate()`. That keeps two useful properties: the tests
 * run against the genuine shape and content of the shop's data, and they go
 * through exactly the code path the live app does, so a change that breaks
 * hydration breaks the suite rather than sliding past it.
 *
 * Registered as a vitest `setupFile` rather than imported per test, because
 * several suites read the catalogue at *module* level — `cart.test.js` resolves
 * its fixtures with `findProduct` before its first `it()` — and a setup file is
 * the only hook that reliably runs before the test module's own imports.
 */
import { hydrate } from '@/data';

import categories from '@/data/categories.json';
import products from '@/data/products.json';
import offers from '@/data/offers.json';
import banners from '@/data/banners.json';
import combos from '@/data/combos.json';
import testimonials from '@/data/testimonials.json';
import faqs from '@/data/faq.json';

hydrate({ products, categories, offers, banners, combos, testimonials, faqs });
