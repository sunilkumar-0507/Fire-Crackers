/**
 * Writes public/sitemap.xml — every page Google should index.
 *
 * Runs before every `npm run build` (the `prebuild` script), so a product
 * added in the admin is in the sitemap the next time the shop is deployed.
 * The catalogue is read from the live API; if that cannot be reached, the
 * seed JSON in src/data is used instead so a build never fails over it.
 *
 *   node scripts/sitemap.mjs
 *
 * Point it at another shop or API with SITE_URL / SITEMAP_API.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = (process.env.SITE_URL || 'https://skvpyros.in').replace(/\/$/, '');
const API = (process.env.SITEMAP_API || 'https://api.skvpyros.in/api').replace(/\/$/, '');

// Checkout, order tracking and the payment return page are left out on
// purpose: they are per-customer and have nothing to rank for.
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/products', priority: '0.9', changefreq: 'daily' },
  { path: '/quick-order', priority: '0.8', changefreq: 'daily' },
  { path: '/combos', priority: '0.8', changefreq: 'weekly' },
  { path: '/bulk-orders', priority: '0.6', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
];

const POLICY_SLUGS = ['delivery', 'cancellation-refund', 'customer-information', 'terms', 'privacy'];

const readSeed = (name) => JSON.parse(readFileSync(`src/data/${name}.json`, 'utf8'));

const loadCatalogue = async () => {
  try {
    const res = await fetch(`${API}/bootstrap`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.products?.length) throw new Error('empty catalogue');
    return { ...data, source: 'live API' };
  } catch (error) {
    console.warn(`[sitemap] API unavailable (${error.message}); using src/data seed instead.`);
    return {
      products: readSeed('products'),
      categories: readSeed('categories'),
      combos: readSeed('combos'),
      source: 'seed data',
    };
  }
};

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const entry = ({ path, priority, changefreq }, lastmod) =>
  [
    '  <url>',
    `    <loc>${escape(SITE + path)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');

const { products = [], categories = [], combos = [], source } = await loadCatalogue();
const today = new Date().toISOString().slice(0, 10);

const pages = [
  ...STATIC_PAGES,
  ...categories.map((c) => ({ path: `/category/${c.slug}`, priority: '0.8', changefreq: 'weekly' })),
  ...products
    .filter((p) => p.active !== false)
    .map((p) => ({ path: `/product/${p.slug}`, priority: '0.7', changefreq: 'weekly' })),
  ...combos.map((c) => ({ path: `/combo/${c.slug}`, priority: '0.7', changefreq: 'weekly' })),
  ...POLICY_SLUGS.map((slug) => ({ path: `/policies/${slug}`, priority: '0.3', changefreq: 'yearly' })),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map((page) => entry(page, today)),
  '</urlset>',
  '',
].join('\n');

writeFileSync('public/sitemap.xml', xml);
console.log(`[sitemap] ${pages.length} URLs written to public/sitemap.xml (from ${source}).`);
