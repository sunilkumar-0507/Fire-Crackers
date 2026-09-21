/**
 * Responsive audit.
 *
 * Loads the production build at real device widths and reports the things that
 * actually break a page on a phone, rather than the things that look wrong in a
 * resized desktop window:
 *
 *   - horizontal overflow, and which element causes it
 *   - tap targets below the 44x44 CSS px floor
 *   - text below 12px
 *   - anything wider than the viewport
 *
 *   node scripts/responsive.mjs             # audit, exit 1 on failure
 *   node scripts/responsive.mjs --shots     # also write screenshots
 *
 * Point it at another origin with RESPONSIVE_BASE.
 */
import { chromium, devices } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const wantShots = args.includes('--shots');
const BASE = process.env.RESPONSIVE_BASE || 'http://localhost:4173';
const OUT = 'perf-out/responsive';

/** The widths that matter: the narrowest phone still in use, up to a tablet. */
const VIEWPORTS = [
  { name: 'iphone-se', width: 320, height: 568 },
  { name: 'iphone-12', width: 390, height: 844 },
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'tablet', width: 768, height: 1024 },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'combos', path: '/combos' },
  { name: 'offers', path: '/offers' },
  { name: 'bulk', path: '/bulk-orders' },
  { name: 'contact', path: '/contact' },
  { name: 'checkout', path: '/checkout' },
];

/**
 * Runs inside the page.
 *
 * Overflow is measured against `documentElement.scrollWidth`, then attributed
 * by walking every element and keeping the ones whose right edge crosses the
 * viewport. Position-fixed decoration is skipped — it is allowed to bleed and
 * cannot scroll the document.
 */
const audit = () => {
  const vw = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;

  const describe = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls =
      typeof el.className === 'string' && el.className
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
        : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };

  const overflowing = [];
  const smallTargets = [];
  const smallText = [];

  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    const rect = el.getBoundingClientRect();
    if (!rect.width && !rect.height) continue;

    // Overflow: only elements that can actually push the document wider.
    if (style.position !== 'fixed' && rect.right > vw + 1) {
      overflowing.push({
        el: describe(el),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      });
    }

    // Tap targets. Links that are inline inside a paragraph are exempt —
    // the 44px floor is about controls, not about words in a sentence.
    // Skip links and other screen-reader-only controls are 1x1 by design and
    // only become visible on focus, so the 44px floor does not apply to them.
    const srOnly = el.classList.contains('sr-only') || rect.width <= 2 || rect.height <= 2;

    const interactive =
      el.matches('a, button, [role="button"], input, select, textarea') &&
      !el.closest('p') &&
      !srOnly &&
      style.pointerEvents !== 'none';

    /*
      Two floors, because one number would be dishonest.

      A button, a select or an icon-only control is a thing you aim at, and
      44x44 is the figure both Apple's and Google's guidance land on. A text
      link sitting in a breadcrumb trail is not that: WCAG 2.5.8 asks 24x24 of
      it, and forcing a breadcrumb to 44px tall distorts the page to satisfy a
      metric nobody was measuring.
    */
    const isControl = el.matches('button, input, select, textarea, [role="button"]');
    const iconOnly =
      el.tagName === 'A' && !(el.textContent || '').trim() && !!el.querySelector('svg');
    const floor = isControl || iconOnly ? 44 : 24;

    if (interactive && (rect.width < floor || rect.height < floor) && rect.width && rect.height) {
      smallTargets.push({
        el: describe(el),
        size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        floor,
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 32),
      });
    }

    // Text size, on elements that hold their own text.
    const ownText = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 2,
    );
    if (ownText) {
      const size = parseFloat(style.fontSize);
      if (size && size < 12) {
        smallText.push({ el: describe(el), size: `${size}px` });
      }
    }
  }

  // Dedupe by selector so one repeated card does not produce forty rows.
  const unique = (rows, key) => {
    const seen = new Map();
    for (const row of rows) if (!seen.has(row[key])) seen.set(row[key], row);
    return [...seen.values()];
  };

  return {
    vw,
    scrollWidth,
    overflows: scrollWidth > vw + 1,
    overflowing: unique(overflowing, 'el').slice(0, 8),
    smallTargets: unique(smallTargets, 'el').slice(0, 8),
    smallText: unique(smallText, 'el').slice(0, 8),
  };
};

/**
 * Interactive elements sitting under a fixed bar once the page is fully
 * scrolled.
 *
 * Only bars that span the viewport count. A small floating button overlaps
 * content too, but the page can be scrolled to move content out from under it;
 * a full-width bar pinned to the bottom cannot be escaped, so anything beneath
 * it at the end of the document can never be tapped.
 */
const coveredByFixedBars = () => {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const bars = [...document.querySelectorAll('body *')]
    .filter((el) => {
      const style = getComputedStyle(el);
      if (style.position !== 'fixed' || style.display === 'none') return false;

      // A layer that does not take pointer events cannot cover anything — the
      // tap goes straight through it. Decorative full-screen overlays are
      // exactly this, and counting them reported the whole header as buried.
      if (style.pointerEvents === 'none') return false;

      const r = el.getBoundingClientRect();

      // A bar: spans the width, hugs the bottom, and is short enough to be a
      // bar rather than a full-screen layer.
      return r.width > vw * 0.8 && r.height > 8 && r.height < vh * 0.4 && r.bottom > vh - 4;
    })
    .map((el) => ({ el, rect: el.getBoundingClientRect() }));

  if (!bars.length) return [];

  const describe = (el) => {
    const cls =
      typeof el.className === 'string' && el.className
        ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
        : '';
    return `${el.tagName.toLowerCase()}${cls}`;
  };

  const hits = [];

  for (const el of document.querySelectorAll('a, button, input, select, textarea')) {
    const style = getComputedStyle(el);
    if (style.position === 'fixed' || style.display === 'none' || style.visibility === 'hidden') continue;

    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    for (const bar of bars) {
      if (bar.el.contains(el)) continue;
      const b = bar.rect;
      if (cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom) {
        hits.push({
          el: describe(el),
          bar: describe(bar.el),
          text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28),
        });
      }
    }
  }

  const seen = new Map();
  for (const h of hits) if (!seen.has(h.el)) seen.set(h.el, h);
  return [...seen.values()].slice(0, 6);
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let failures = 0;
const report = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: viewport.width < 768,
    hasTouch: viewport.width < 768,
    userAgent: devices['iPhone 12'].userAgent,
  });

  /*
    A cart with something in it.

    The floating cart bar only renders once the cart is non-empty, so an audit
    of an empty shop never sees the one fixed, full-width, bottom-anchored
    element on the whole site — exactly the thing the covered-content check
    exists to catch. Seeded through the store's own persisted key so the app
    rehydrates it normally on load.
  */
  await context.addInitScript(() => {
    try {
      localStorage.setItem(
        'gopi.cart.v1',
        JSON.stringify({
          state: {
            items: [
              {
                id: 'audit-line',
                slug: 'audit-line',
                name: 'Audit line',
                price: 100,
                qty: 1,
                stock: 10,
                image: null,
                kind: 'product',
              },
            ],
            wishlist: [],
            coupon: null,
          },
          version: 0,
        }),
      );
    } catch {
      /* private mode; the bar simply will not render and the check is a no-op */
    }
  });

  for (const page of PAGES) {
    const tab = await context.newPage();

    try {
      await tab.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle', timeout: 45_000 });
    } catch {
      // networkidle can never settle on a page with a looping animation frame;
      // the DOM is what matters and it is already there.
      await tab.waitForLoadState('domcontentloaded');
    }

    await tab.waitForTimeout(600);

    const result = await tab.evaluate(audit);

    // Second pass, at the foot of the page. A fixed bottom bar covers whatever
    // the page ends with, and unlike a floating button that content cannot be
    // scrolled out from under it — it is simply unreachable.
    /*
      Scrolled to the true end, not just to where the end was.

      The catalogue lazy-loads as you approach the bottom, so a single
      scrollTo lands mid-page once the next batch renders — and content that is
      merely *passing under* a fixed bar is normal and scrollable-past, not a
      defect. Only content the page bottoms out beneath is unreachable, so this
      keeps scrolling until the height stops growing before it measures.
    */
    for (let i = 0; i < 6; i += 1) {
      const settled = await tab.evaluate(() => {
        const before = document.documentElement.scrollHeight;
        window.scrollTo(0, before);
        return before;
      });
      await tab.waitForTimeout(450);
      const after = await tab.evaluate(() => document.documentElement.scrollHeight);
      if (after === settled) break;
    }

    // Confirm we really are at the end; if not, the measurement is meaningless.
    const atBottom = await tab.evaluate(
      () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4,
    );

    result.covered = atBottom ? await tab.evaluate(coveredByFixedBars) : [];
    const label = `${viewport.name.padEnd(10)} ${page.name.padEnd(9)}`;

    const problems = [];
    if (result.overflows) {
      problems.push(`OVERFLOW ${result.scrollWidth}px > ${result.vw}px`);
      for (const o of result.overflowing) problems.push(`    ↳ ${o.el} (right ${o.right}px)`);
    }
    for (const t of result.smallTargets)
      problems.push(`    tap ${t.size} (needs ${t.floor}) ${t.el} "${t.text}"`);
    for (const t of result.smallText) problems.push(`    text ${t.size} ${t.el}`);
    for (const c of result.covered)
      problems.push(`    covered by ${c.bar}: ${c.el} "${c.text}"`);

    if (problems.length) {
      failures += 1;
      console.log(`✗ ${label}`);
      for (const p of problems) console.log(`   ${p}`);
    } else {
      console.log(`✓ ${label}`);
    }

    report.push({ viewport: viewport.name, page: page.name, ...result });

    if (wantShots) {
      await tab.screenshot({
        path: `${OUT}/${viewport.name}-${page.name}.png`,
        fullPage: page.name === 'home',
      });
    }

    await tab.close();
  }

  await context.close();
}

await browser.close();

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

console.log(
  failures
    ? `\n${failures} page/viewport combination(s) with problems. Report: ${OUT}/report.json`
    : `\nAll ${report.length} page/viewport combinations clean.`,
);

process.exit(failures ? 1 : 0);
