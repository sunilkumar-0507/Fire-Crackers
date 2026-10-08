import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { findCategory, findCombo, findProduct } from '@/data';
import { findPolicy } from '@/constants/policies';
import { formatPrice } from '@/utils/format';

/**
 * Per-page <title>, meta description and canonical link.
 *
 * The shop is a single-page app, so index.html's tags are what every URL
 * starts with. Google runs the JavaScript before indexing, and this rewrites
 * them on each navigation — without it, all two hundred product pages in the
 * sitemap would be indexed under the homepage's title and description.
 *
 * Lives in one place, keyed off the URL, rather than as a hook in each page,
 * so a new route gets a sensible title from the fallback without anyone
 * remembering to add one.
 */
const SITE = 'https://skvpyros.in';
const BRAND = 'SKV Pyros';

const DEFAULT = {
  title: `${BRAND} | Buy Sivakasi Crackers Online — Diwali 2026`,
  description:
    'SKV Pyros, Sivakasi — buy Diwali crackers online at factory prices. Sparklers, flower pots, ground chakkars, rockets, aerial shots and family combo packs, delivered across Tamil Nadu and Kerala.',
};

const STATIC = {
  '/products': {
    title: `All Crackers — Price List & Online Shop | ${BRAND}`,
    description:
      'Browse every cracker in the SKV Pyros range — sparklers, flower pots, chakkars, rockets, aerial shots and more, at Sivakasi factory prices.',
  },
  '/quick-order': {
    title: `Quick Order — Crackers Price List 2026 | ${BRAND}`,
    description:
      'The full SKV Pyros price list on one page. Enter quantities and order your Diwali crackers in minutes.',
  },
  '/combos': {
    title: `Cracker Combo Packs & Gift Boxes | ${BRAND}`,
    description:
      'Ready-made Diwali cracker combo boxes for every family size and budget, packed in Sivakasi.',
  },
  '/bulk-orders': {
    title: `Bulk & Wholesale Cracker Orders | ${BRAND}`,
    description:
      'Crackers in bulk for events, companies, temples and resellers, straight from our Sivakasi factory.',
  },
  '/about': {
    title: `About Us — Sivakasi Cracker Makers | ${BRAND}`,
    description: 'SKV Pyros has made fireworks in Sivakasi since 1994. Meet the family behind the factory.',
  },
  '/contact': {
    title: `Contact Us | ${BRAND}`,
    description: 'Call, WhatsApp or visit SKV Pyros in Sivakasi for orders and enquiries.',
  },
  '/checkout': { title: `Checkout | ${BRAND}` },
  '/track': { title: `Track Your Order | ${BRAND}` },
};

/** Meta descriptions over ~160 characters are cut off in results anyway. */
const clip = (text = '', max = 158) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

const metaFor = (pathname) => {
  if (STATIC[pathname]) return STATIC[pathname];

  const [, kind, slug] = pathname.split('/');

  if (kind === 'product') {
    const p = findProduct(slug);
    if (p)
      return {
        title: `${p.name} — ${formatPrice(p.price)} | Buy Online | ${BRAND}`,
        description: clip(p.description),
      };
  }

  if (kind === 'category') {
    const c = findCategory(slug);
    if (c)
      return {
        title: `${c.name}${c.tamilName ? ` (${c.tamilName})` : ''} — Buy Online | ${BRAND}`,
        description: clip(c.description),
      };
  }

  if (kind === 'combo') {
    const c = findCombo(slug);
    if (c)
      return {
        title: `${c.name} — Cracker Combo ${formatPrice(c.price)} | ${BRAND}`,
        description: clip(c.description),
      };
  }

  if (kind === 'policies') {
    const p = findPolicy(slug);
    if (p) return { title: `${p.title} | ${BRAND}`, description: clip(p.summary) };
  }

  return DEFAULT;
};

const setMeta = (selector, create, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', value);
};

export const RouteMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description = DEFAULT.description } = metaFor(pathname);
    const url = SITE + (pathname === '/' ? '/' : pathname.replace(/\/$/, ''));

    document.title = title;
    setMeta(
      'meta[name="description"]',
      () => Object.assign(document.createElement('meta'), { name: 'description' }),
      description,
    );
    setMeta(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      url,
    );
    setMeta('meta[property="og:title"]', () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:title');
      return el;
    }, title);
    setMeta('meta[property="og:url"]', () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:url');
      return el;
    }, url);
  }, [pathname]);

  return null;
};

export default RouteMeta;
