/**
 * Performance harness.
 *
 * Drives the production build in real Chromium and reports what actually
 * costs frames: long tasks, scripted-scroll frame rate, and how much of the
 * frame budget goes to style/layout/paint/composite.
 *
 *   node scripts/perf.mjs            # normal CPU
 *   node scripts/perf.mjs --cpu 4    # 4x CPU throttle (mid-range laptop)
 *   node scripts/perf.mjs --shots    # also write screenshots
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const cpuThrottle = Number(args[args.indexOf('--cpu') + 1]) || 1;
const wantShots = args.includes('--shots');
const BASE = process.env.PERF_BASE || 'http://localhost:4173';
const OUT = 'perf-out';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'product', path: '/product/royal-gold-sparkler-30cm' },
  { name: 'combos', path: '/combos' },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

// Skip the cinematic intro — we are measuring the site, not the splash.
await context.addInitScript(() => {
  try {
    sessionStorage.setItem('gopi.splash.session', '1');
  } catch {
    /* ignore */
  }
});

const results = [];

for (const target of PAGES) {
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  if (cpuThrottle > 1) {
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
  }

  // Collect long tasks (>50ms blocking) from the very first frame.
  await page.addInitScript(() => {
    window.__longTasks = [];
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({ start: Math.round(entry.startTime), dur: Math.round(entry.duration) });
      }
    }).observe({ entryTypes: ['longtask'] });
    window.__shifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.hadRecentInput) continue;
        window.__cls += entry.value;
        for (const source of entry.sources ?? []) {
          const el = source.node;
          if (!el || !el.tagName) continue;
          window.__shifts.push({
            value: Math.round(entry.value * 1000) / 1000,
            at: Math.round(entry.startTime),
            el: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`,
          });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  const t0 = Date.now();
  await page.goto(BASE + target.path, { waitUntil: 'load' });
  const loadMs = Date.now() - t0;

  // Lazy routes arrive after `load`. Wait for the chunk to land and the tree to
  // settle, otherwise we measure the Suspense skeleton instead of the page.
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll('*').length > 600, null, { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(2000);

  const paint = await page.evaluate(() => {
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      fcp: fcp ? Math.round(fcp.startTime) : null,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    };
  });

  /* ---------------- idle frame rate (nothing happening) ---------------- */
  const idle = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0;
        let worst = 0;
        let last = performance.now();
        const start = last;
        const tick = (now) => {
          const delta = now - last;
          last = now;
          if (frames > 0) worst = Math.max(worst, delta);
          frames += 1;
          if (now - start < 2000) requestAnimationFrame(tick);
          else resolve({ fps: Math.round((frames / (now - start)) * 1000), worstFrameMs: Math.round(worst) });
        };
        requestAnimationFrame(tick);
      }),
  );

  /* ---------------- frame rate during a scripted scroll ---------------- */
  const scroll = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const frameTimes = [];
        let last = performance.now();
        const start = last;
        let y = 0;

        const tick = (now) => {
          frameTimes.push(now - last);
          last = now;
          y += 26;
          window.scrollTo(0, y);
          if (now - start < 3000) requestAnimationFrame(tick);
          else {
            const times = frameTimes.slice(1).sort((a, b) => a - b);
            const at = (p) => Math.round(times[Math.floor(times.length * p)] ?? 0);
            resolve({
              fps: Math.round((frameTimes.length / (now - start)) * 1000),
              medianFrameMs: at(0.5),
              p95FrameMs: at(0.95),
              worstFrameMs: Math.round(times[times.length - 1] ?? 0),
              janks: times.filter((t) => t > 32).length,
              frames: times.length,
            });
          }
        };
        requestAnimationFrame(tick);
      }),
  );

  const metrics = await client.send('Performance.getMetrics');
  const pick = (n) => Math.round((metrics.metrics.find((m) => m.name === n)?.value ?? 0) * 1000);

  const observed = await page.evaluate(() => ({
    longTasks: window.__longTasks.length,
    longTaskMs: window.__longTasks.reduce((n, t) => n + t.dur, 0),
    worstLongTask: window.__longTasks.reduce((n, t) => Math.max(n, t.dur), 0),
    cls: Math.round((window.__cls ?? 0) * 1000) / 1000,
    shifts: (window.__shifts ?? [])
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    nodes: document.querySelectorAll('*').length,
    blurred: [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return (s.backdropFilter && s.backdropFilter !== 'none') || (s.filter && s.filter.includes('blur'));
    }).length,
    animating: [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return s.animationName && s.animationName !== 'none';
    }).length,
    blends: [...document.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return s.mixBlendMode && s.mixBlendMode !== 'normal';
    }).length,
  }));

  results.push({
    page: target.name,
    loadMs,
    ...paint,
    idle,
    scroll,
    ...observed,
    styleMs: pick('RecalcStyleDuration'),
    layoutMs: pick('LayoutDuration'),
    scriptMs: pick('ScriptDuration'),
  });

  if (wantShots) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${target.name}.png` });
    await page.screenshot({ path: `${OUT}/${target.name}-full.png`, fullPage: true });
  }

  await page.close();
}

await browser.close();

const label = `CPU throttle ${cpuThrottle}x`;
console.log(`\n=== ${label} — ${BASE} ===\n`);
for (const r of results) {
  console.log(`${r.page.toUpperCase()}`);
  console.log(`  load ${r.loadMs}ms · FCP ${r.fcp}ms · CLS ${r.cls}`);
  console.log(`  idle    ${r.idle.fps} fps (worst frame ${r.idle.worstFrameMs}ms)`);
  console.log(
    `  scroll  ${r.scroll.fps} fps · median ${r.scroll.medianFrameMs}ms · p95 ${r.scroll.p95FrameMs}ms · worst ${r.scroll.worstFrameMs}ms · ${r.scroll.janks}/${r.scroll.frames} janked`,
  );
  console.log(
    `  longtasks ${r.longTasks} (${r.longTaskMs}ms total, worst ${r.worstLongTask}ms) · style ${r.styleMs}ms · layout ${r.layoutMs}ms · script ${r.scriptMs}ms`,
  );
  console.log(`  DOM ${r.nodes} nodes · ${r.blurred} blurred · ${r.animating} css-animating · ${r.blends} blend-mode`);
  if (r.shifts?.length) {
    console.log(`  shift sources: ${r.shifts.map((s) => `${s.el} (${s.value} @${s.at}ms)`).join(', ')}`);
  }
  console.log('');
}

writeFileSync(`${OUT}/report-${cpuThrottle}x.json`, JSON.stringify(results, null, 2));
console.log(`Written to ${OUT}/report-${cpuThrottle}x.json`);
