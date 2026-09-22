/**
 * The hero's firework simulation.
 *
 * The thing worth asserting is not that pixels appear — it is that the motion
 * is a simulation rather than a loop. A shell has to climb, decelerate under
 * gravity and burst near the top of its arc; sparks have to spread from that
 * point, slow against drag, fall, and burn out. Get any of those wrong and it
 * still animates, it just stops looking like a firework.
 */
import { describe, it, expect } from 'vitest';
import {
  GRAVITY,
  DRAG,
  PALETTE,
  advanceParticle,
  advanceShell,
  burstShell,
  burstSizeFor,
  createShell,
  particleAlpha,
  scaleFor,
  shouldBurst,
} from '@/components/fx/fireworksSim';

const W = 640;
const H = 780;

/** Runs a shell until it bursts, returning its path. Guards against never bursting. */
const flyUntilBurst = (shell, limit = 600) => {
  const path = [{ x: shell.x, y: shell.y }];

  for (let i = 0; i < limit; i++) {
    if (shouldBurst(shell)) return { path, frames: i, burst: true };
    advanceShell(shell);
    path.push({ x: shell.x, y: shell.y });
  }

  return { path, frames: limit, burst: false };
};

describe('a shell', () => {
  it('starts below the frame so it rises into view', () => {
    for (let i = 0; i < 40; i++) {
      const shell = createShell(W, H);
      expect(shell.y).toBeGreaterThan(H);
    }
  });

  it('launches upward', () => {
    for (let i = 0; i < 40; i++) {
      expect(createShell(W, H).vy).toBeLessThan(0);
    }
  });

  it('decelerates on the way up, because gravity is working on it', () => {
    const shell = createShell(W, H);
    const speeds = [];

    for (let i = 0; i < 12; i++) {
      speeds.push(-shell.vy);
      advanceShell(shell);
    }

    // Each frame it is travelling upward a little slower than the last.
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeLessThan(speeds[i - 1]);
      expect(speeds[i - 1] - speeds[i]).toBeCloseTo(GRAVITY, 6);
    }
  });

  it('always bursts, and does so in the upper half of the canvas', () => {
    for (let i = 0; i < 60; i++) {
      const shell = createShell(W, H);
      const { burst, frames } = flyUntilBurst(shell);

      expect(burst).toBe(true);
      // Not instantly, and not after an age — it should read as a climb.
      expect(frames).toBeGreaterThan(8);
      expect(shell.y).toBeLessThan(H * 0.55);
    }
  });

  it('never leaves the top of the canvas before bursting', () => {
    for (let i = 0; i < 60; i++) {
      const { path } = flyUntilBurst(createShell(W, H));
      expect(Math.min(...path.map((p) => p.y))).toBeGreaterThan(-1);
    }
  });

  it('takes a different path every time', () => {
    const ends = new Set(
      Array.from({ length: 30 }, () => {
        const shell = createShell(W, H);
        flyUntilBurst(shell);
        return `${Math.round(shell.x)}:${Math.round(shell.y)}`;
      }),
    );

    // A loop would land in the same handful of places.
    expect(ends.size).toBeGreaterThan(20);
  });

  it('scales its launch to the canvas, so a short one is not overshot', () => {
    const short = createShell(W, 300);
    const tall = createShell(W, 1200);

    // Velocity is proportional to height, so both cross their own frame.
    expect(-tall.vy).toBeGreaterThan(-short.vy);
  });

  it('keeps only a short tail behind it', () => {
    const shell = createShell(W, H);
    for (let i = 0; i < 40; i++) advanceShell(shell);

    expect(shell.trail.length).toBeLessThanOrEqual(7);
  });
});

describe('a burst', () => {
  const explode = () => {
    const shell = createShell(W, H);
    flyUntilBurst(shell);
    return { shell, particles: burstShell(shell, 1, 70) };
  };

  it('throws sparks out from the point the shell reached', () => {
    const { shell, particles } = explode();

    expect(particles.length).toBeGreaterThan(50);
    for (const p of particles) {
      expect(p.x).toBeCloseTo(shell.x, 6);
      expect(p.y).toBeCloseTo(shell.y, 6);
    }
  });

  it('sends them in every direction', () => {
    const { particles } = explode();

    expect(particles.some((p) => p.vx > 0)).toBe(true);
    expect(particles.some((p) => p.vx < 0)).toBe(true);
    expect(particles.some((p) => p.vy > 0)).toBe(true);
    expect(particles.some((p) => p.vy < 0)).toBe(true);
  });

  it('uses two speeds, so it layers rather than forming one ring', () => {
    const { particles } = explode();
    const speeds = particles.map((p) => Math.hypot(p.vx, p.vy));

    // A single ring would be nearly uniform; two give a real spread.
    expect(Math.max(...speeds) / Math.min(...speeds)).toBeGreaterThan(1.8);
  });

  it('burns one shell colour, not a rainbow', () => {
    const { shell, particles } = explode();
    const used = new Set(particles.map((p) => p.colour));

    expect(used.size).toBeLessThanOrEqual(2);
    for (const colour of used) expect([shell.core, shell.tint]).toContain(colour);
  });

  it('draws its colours from the brand palette', () => {
    const flat = PALETTE.flat();
    for (let i = 0; i < 30; i++) {
      const shell = createShell(W, H);
      expect(flat).toContain(shell.core);
      expect(flat).toContain(shell.tint);
    }
  });
});

describe('a spark', () => {
  const spark = () => burstShell(createShell(W, H), 1, 70)[0];

  it('slows against the air', () => {
    const p = spark();
    p.vx = 4;
    p.vy = -4;

    const before = Math.abs(p.vx);
    advanceParticle(p);

    expect(Math.abs(p.vx)).toBeCloseTo(before * DRAG, 6);
  });

  it('ends up falling, however it started', () => {
    const p = spark();
    p.vx = 0;
    p.vy = -3;
    p.decay = 0.0001; // keep it alive long enough to turn over

    for (let i = 0; i < 300; i++) advanceParticle(p);

    expect(p.vy).toBeGreaterThan(0);
  });

  it('burns out rather than drifting forever', () => {
    for (let i = 0; i < 40; i++) {
      const p = spark();
      let frames = 0;
      while (advanceParticle(p) && frames < 5000) frames++;

      expect(frames).toBeLessThan(5000);
      // And not so fast that the burst never reads.
      expect(frames).toBeGreaterThan(30);
    }
  });

  it('holds its brightness and then goes, rather than dimming evenly', () => {
    const p = { ...spark(), life: 1, twinkle: false };
    const half = particleAlpha({ ...p, life: 0.5 });

    // Faster than linear (which would be 0.5) so it drops away at the end,
    // but not squared (0.25), which on a cream page left nothing to see by
    // the time the burst had opened.
    expect(half).toBeLessThan(0.5);
    expect(half).toBeGreaterThan(0.3);

    expect(particleAlpha({ ...p, life: 1 })).toBeCloseTo(1, 6);
    expect(particleAlpha({ ...p, life: 0 })).toBe(0);
  });

  it('never reports an alpha outside 0–1, even when twinkling', () => {
    const p = { ...spark(), twinkle: true, life: 0.5 };

    for (const flicker of [0, 0.44, 0.46, 1]) {
      const a = particleAlpha(p, flicker);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(1);
    }
  });
});

describe('sizing for the viewport', () => {
  it('does less work on a phone than on a desktop', () => {
    expect(burstSizeFor(390)).toBeLessThan(burstSizeFor(700));
    expect(burstSizeFor(700)).toBeLessThan(burstSizeFor(1100));
  });

  it('scales the animation down rather than cropping it', () => {
    // Compared below the ceiling: anything past ~600px is clamped to the same
    // value on purpose, so a huge canvas does not get huge sparks.
    expect(scaleFor(450)).toBeLessThan(scaleFor(520));
    expect(scaleFor(520)).toBeLessThan(scaleFor(580));
  });

  it('clamps, so a very small or very large box stays sensible', () => {
    // The floor is what keeps sparks above a pixel on a phone. Below it they
    // are drawn correctly and cannot be seen.
    expect(scaleFor(10)).toBeGreaterThanOrEqual(0.8);
    expect(scaleFor(6000)).toBeLessThanOrEqual(1.15);
  });

  it('keeps sparks inside the canvas width it was given', () => {
    for (let i = 0; i < 40; i++) {
      const shell = createShell(400, 600);
      expect(shell.x).toBeGreaterThan(0);
      expect(shell.x).toBeLessThan(400);
    }
  });
});
