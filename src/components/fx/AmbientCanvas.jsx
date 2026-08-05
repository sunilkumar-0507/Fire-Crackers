import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

const GOLD = ['255,213,106', '255,138,0', '255,190,120', '255,240,196', '200,77,14'];

/** Pre-rendered glow sprite — one per colour, built once, then blitted. */
const makeSprite = (rgb, size = 32) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, `rgba(${rgb},1)`);
  gradient.addColorStop(0.25, `rgba(${rgb},.85)`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

/**
 * Ambient background: drifting golden motes, rising embers, occasional
 * distant fireworks. One canvas, one requestAnimationFrame loop.
 *
 * PERF — three things keep this close to free:
 *
 *  1. **Sprites, not gradients.** The original built a `createRadialGradient`
 *     per particle per frame — up to 64 gradient objects every 16ms, which
 *     alone held the idle page in the single-digit FPS range. Each colour is
 *     now rasterised once into a 32px offscreen canvas and blitted with
 *     `drawImage`, which is a straight GPU copy.
 *  2. **30fps, not 60.** Motes drift slowly; nobody can tell. Halving the
 *     tick rate halves the cost and hands the spare frames to scrolling.
 *  3. **It stops when it can't be seen** — hidden tab, or scrolled past.
 *
 * Also honours prefers-reduced-motion by painting one static frame.
 */
export const AmbientCanvas = ({ density = 1, fireworks = true, className }) => {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const sprites = GOLD.map((rgb) => makeSprite(rgb));

    let width = 0;
    let height = 0;
    let motes = [];
    let bursts = [];
    let raf = 0;
    let running = false;
    let last = performance.now();
    let nextBurst = last + 4000;

    const FRAME_MS = 1000 / 30; // ambient layer runs at 30fps
    let accumulator = 0;

    const rand = (min, max) => min + Math.random() * (max - min);

    const spawnMote = (anywhere = false) => ({
      x: rand(0, width),
      y: anywhere ? rand(0, height) : height + rand(10, 90),
      r: rand(1.6, 5.2),
      vy: Math.random() < 0.82 ? rand(-0.6, -0.12) : rand(0.08, 0.24),
      vx: rand(-0.32, 0.32),
      alpha: rand(0.25, 0.75),
      sprite: sprites[(Math.random() * sprites.length) | 0],
    });

    const resize = () => {
      // DPR 1 is plenty for soft out-of-focus blobs and halves the fill cost.
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;

      const target = Math.min(28, Math.max(8, Math.round((width * height) / 62000) * density));
      motes = Array.from({ length: target }, () => spawnMote(true));
    };

    const launchBurst = () => {
      const cx = rand(width * 0.12, width * 0.88);
      const cy = rand(height * 0.1, height * 0.46);
      const sprite = sprites[(Math.random() * sprites.length) | 0];
      const speed = rand(1.6, 3);

      for (let i = 0; i < 18; i += 1) {
        const angle = (i / 18) * Math.PI * 2;
        const v = speed * rand(0.65, 1.15);
        bursts.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 1,
          decay: rand(0.012, 0.024),
          r: rand(2.4, 4.6),
          sprite,
        });
      }
    };

    const blit = (sprite, x, y, r, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < motes.length; i += 1) {
        const m = motes[i];
        m.x += m.vx;
        m.y += m.vy;

        if (m.y < -24 || m.y > height + 24 || m.x < -24 || m.x > width + 24) {
          motes[i] = spawnMote();
          continue;
        }
        blit(m.sprite, m.x, m.y, m.r * 3.4, m.alpha);
      }

      if (fireworks) {
        for (let i = bursts.length - 1; i >= 0; i -= 1) {
          const p = bursts[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.028;
          p.vx *= 0.985;
          p.life -= p.decay;

          if (p.life <= 0) {
            bursts.splice(i, 1);
            continue;
          }
          blit(p.sprite, p.x, p.y, p.r * p.life * 2.6, p.life * 0.8);
        }
      }

      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);

      accumulator += now - last;
      last = now;
      if (accumulator < FRAME_MS) return;
      accumulator = 0;

      if (fireworks && now > nextBurst) {
        launchBurst();
        nextBurst = now + rand(8000, 16000);
      }
      step();
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      accumulator = 0;
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only run while the canvas is actually on screen.
    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    );

    const onVisibility = () => (document.hidden ? stop() : start());

    resize();

    if (reduced) {
      step();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    visibility.observe(canvas);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      visibility.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, fireworks, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? 'pointer-events-none fixed inset-0 -z-10 h-full w-full'}
    />
  );
};

export default AmbientCanvas;
