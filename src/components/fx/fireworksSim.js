/**
 * The firework simulation, with no canvas and no DOM in it.
 *
 * Split out from the component on purpose. The motion is the part worth being
 * sure about — that a shell really climbs, decelerates and bursts, and that
 * sparks really slow, fall and die rather than drifting forever — and none of
 * that needs a browser to check. `Fireworks.jsx` is then only the canvas, the
 * lifecycle and the paint.
 *
 * Everything is per-frame at roughly 60fps rather than per-second. The numbers
 * are small because they compound sixty times a second.
 */

/** Per-frame downward pull. */
export const GRAVITY = 0.038;

/** Air resistance, applied to sparks. Under 1, so they settle the way real ones do. */
export const DRAG = 0.985;

/**
 * Shell colours, as [core, tint] pairs.
 *
 * Real shells burn one or two colours, not a rainbow — mixing every hue into a
 * single burst is what makes canvas fireworks look like a screensaver. These
 * are the storefront's own accents, so the hero stays on-brand.
 */
export const PALETTE = [
  ['#FF8A00', '#FFD56A'],
  ['#D9539B', '#FFC2E0'],
  ['#E5B23C', '#FFF0C4'],
  ['#4FB0C6', '#BDEDE4'],
  ['#C84D0E', '#FF9E1E'],
  ['#9B7BF0', '#D8C7FF'],
];

const rand = (min, max) => min + Math.random() * (max - min);

/**
 * A shell leaving the ground.
 *
 * It starts just below the frame so it rises into view rather than appearing,
 * and its launch velocity is proportional to the height it has to cross — the
 * same shell on a short mobile canvas would otherwise fly straight out of the top.
 */
export const createShell = (width, height, scale = 1) => {
  const [core, tint] = PALETTE[Math.floor(Math.random() * PALETTE.length)];

  return {
    x: rand(width * 0.18, width * 0.92),
    y: height + rand(4, 40),
    vx: rand(-0.35, 0.35) * scale,
    vy: -rand(height * 0.0125, height * 0.0165),
    // Bursting exactly at the apex looks mechanical; a little before it does not.
    burstAt: rand(height * 0.12, height * 0.46),
    core,
    tint,
    trail: [],
  };
};

/** Moves a shell one frame, recording the short tail drawn behind it. */
export const advanceShell = (shell) => {
  shell.trail.push({ x: shell.x, y: shell.y });
  if (shell.trail.length > 7) shell.trail.shift();

  shell.x += shell.vx;
  shell.y += shell.vy;
  shell.vy += GRAVITY;

  return shell;
};

/** True once the shell has reached its height, or has started to fall. */
export const shouldBurst = (shell) => shell.y <= shell.burstAt || shell.vy >= -0.25;

/**
 * The sparks a shell becomes.
 *
 * Two rings at different speeds, which is what gives the layered "peony" look
 * that a single even ring misses. Angles are evenly spread and then jittered —
 * perfectly even reads as a mechanical starburst.
 */
export const burstShell = (shell, scale = 1, count = 70) => {
  const particles = [];
  const rings = [
    { speed: rand(1.5, 2.3), share: 0.45 },
    { speed: rand(2.8, 4.1), share: 0.55 },
  ];

  for (const ring of rings) {
    const n = Math.max(1, Math.round(count * ring.share));

    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n + rand(-0.14, 0.14);
      const speed = ring.speed * rand(0.72, 1.18) * scale;

      particles.push({
        x: shell.x,
        y: shell.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        // Uneven lifetimes are what make a burst dissolve rather than vanish.
        decay: rand(0.007, 0.015),
        size: rand(1.6, 3.1) * scale,
        // A minority burn the paler tint, as a two-colour shell does. Kept low
        // because this canvas sits on cream, not on a night sky — the pale
        // half of each pair barely reads against the page.
        colour: Math.random() < 0.16 ? shell.tint : shell.core,
        twinkle: Math.random() < 0.22,
      });
    }
  }

  return particles;
};

/** Moves a spark one frame. Returns false once it has burnt out. */
export const advanceParticle = (p) => {
  p.x += p.vx;
  p.y += p.vy;
  p.vx *= DRAG;
  p.vy *= DRAG;
  p.vy += GRAVITY;
  p.life -= p.decay;

  return p.life > 0;
};

/**
 * How bright a spark is right now, 0–1.
 *
 * Falls off faster than linear, so sparks hold their brightness and then go
 * rather than dimming evenly for their whole life — but not squared, which on
 * a cream background washed them out to nothing by mid-life. The twinkle is a
 * late-life flicker on a minority of them.
 */
export const particleAlpha = (p, flicker = Math.random()) => {
  let alpha = p.life ** 1.5;
  if (p.twinkle && p.life < 0.55) alpha *= flicker < 0.45 ? 0.25 : 1.25;
  return Math.max(0, Math.min(1, alpha));
};

/** Particle count for a canvas of this width — a phone does less work. */
export const burstSizeFor = (width) => (width < 420 ? 44 : width < 720 ? 58 : 76);

/**
 * Speed and size multiplier for a canvas of this width, so a small canvas gets
 * the same animation scaled down rather than the desktop one cropped.
 *
 * The floor matters more than it looks. A spark's radius is this multiplied by
 * ~2px, so a low floor produces sub-pixel sparks that are invisible on a phone
 * no matter what opacity they are given — the animation runs perfectly and
 * nothing can be seen. 0.8 keeps them legible while still letting a small
 * canvas hold a whole burst.
 */
export const scaleFor = (width) => Math.max(0.8, Math.min(1.15, width / 520));
