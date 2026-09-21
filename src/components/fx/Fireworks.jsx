import { memo, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import {
  advanceParticle,
  advanceShell,
  burstShell,
  burstSizeFor,
  createShell,
  particleAlpha,
  scaleFor,
  shouldBurst,
} from './fireworksSim';

/**
 * Shells launching and bursting, on a canvas.
 *
 * A page-wide version of this used to sit behind everything and was removed for
 * good reasons: body text ended up on a moving coloured field, and a page that
 * never holds still is tiring to read a price list on. Both of those were
 * consequences of where it was, not of what it was — so this one is bounded to
 * the decorative half of the hero, is masked away from the copy by the caller,
 * and nothing is ever laid on top of it.
 *
 * The motion is simulated rather than keyframed, which is why it reads as a
 * firework instead of as a loop: no two shells go up the same way and none of
 * them repeat. The physics lives in `fireworksSim.js`; this file is the canvas,
 * the lifecycle and the paint.
 */

/** Ceilings on concurrent work, so a long-open tab cannot accumulate. */
const MAX_SHELLS = 3;
const MAX_PARTICLES = 520;

/**
 * How much of the previous frame is erased each tick — this is the trail.
 *
 * Lower than it was: on a cream page the sparks are already fighting for
 * contrast, and erasing an eighth of them every frame left the burst a faint
 * smudge by the time it had opened.
 */
const TRAIL_FADE = 0.09;

export const Fireworks = memo(function Fireworks({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext?.('2d');
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let scale = 1;
    let perBurst = 70;

    let shells = [];
    let particles = [];
    let frame = 0;
    let nextLaunch = 0;
    let running = false;
    let handle = 0;

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;

      // Capped: a 3x device pixel ratio triples the fill cost for a decorative
      // layer nobody is inspecting closely.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      scale = scaleFor(width);
      perBurst = burstSizeFor(width);
      return true;
    };

    const drawShell = (shell) => {
      // The climbing tail: a thin streak that tapers towards where it has been.
      context.lineCap = 'round';
      for (let i = 1; i < shell.trail.length; i++) {
        const a = shell.trail[i - 1];
        const b = shell.trail[i];
        context.globalAlpha = (i / shell.trail.length) * 0.5;
        context.strokeStyle = shell.tint;
        context.lineWidth = (i / shell.trail.length) * 2.1 * scale;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }

      // The head, which is the brightest thing on the canvas.
      context.globalAlpha = 0.95;
      context.fillStyle = shell.core;
      context.beginPath();
      context.arc(shell.x, shell.y, 1.9 * scale, 0, Math.PI * 2);
      context.fill();
    };

    const step = () => {
      if (!running) return;

      frame += 1;

      // Erase a little of the previous frame rather than clearing it. On a
      // transparent canvas that means `destination-out`, which thins what is
      // already there instead of painting over it — the page colour shows
      // through, and every spark leaves a tail that decays on its own.
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';

      if (frame >= nextLaunch && shells.length < MAX_SHELLS && particles.length < MAX_PARTICLES) {
        shells.push(createShell(width, height, scale));
        // Irregular spacing. A fixed cadence is the other thing that gives a
        // canvas away as a loop.
        nextLaunch = frame + Math.round(38 + Math.random() * 66);
      }

      const climbing = [];
      for (const shell of shells) {
        advanceShell(shell);

        if (shouldBurst(shell)) {
          if (particles.length < MAX_PARTICLES) {
            particles = particles.concat(burstShell(shell, scale, perBurst));
          }
          continue;
        }

        drawShell(shell);
        climbing.push(shell);
      }
      shells = climbing;

      const alive = [];
      for (const p of particles) {
        if (!advanceParticle(p)) continue;

        context.globalAlpha = particleAlpha(p);
        context.fillStyle = p.colour;
        context.beginPath();
        context.arc(p.x, p.y, Math.max(0.35, p.size * p.life), 0, Math.PI * 2);
        context.fill();

        alive.push(p);
      }
      particles = alive;

      context.globalAlpha = 1;
      handle = window.requestAnimationFrame(step);
    };

    const start = () => {
      if (running || !measure()) return;
      running = true;
      handle = window.requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      if (handle) window.cancelAnimationFrame(handle);
      handle = 0;
    };

    /*
      Runs by default, and is paused by what it learns afterwards.

      The observer is an optimisation — it stops the loop once the hero has
      scrolled away — so it must not also be the thing that starts it. Waiting
      for a first callback meant a throttled or delayed observer left the canvas
      permanently blank, and for a decoration "never starts" is a far worse
      failure than "starts, then pauses a moment later". The hero is at the top
      of the page, so visible is also the correct initial state.
    */
    let visible = true;

    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    let observer;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          sync();
        },
        { threshold: 0.01 },
      );
      observer.observe(canvas);
    }

    document.addEventListener('visibilitychange', sync);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        // Re-measuring resets the transform, so anything mid-flight would be
        // drawn against the old geometry. Cheaper and cleaner to start over.
        if (measure()) {
          shells = [];
          particles = [];
        }
      });
      resizeObserver.observe(canvas);
    }

    sync();

    return () => {
      stop();
      observer?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none h-full w-full', className)}
    />
  );
});

export default Fireworks;
