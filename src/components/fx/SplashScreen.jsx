import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { BRAND } from '@/constants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

const RAYS = 22;
const EMBERS = 26;
const SESSION_KEY = 'gopi.splash.session';

/**
 * Cinematic intro.
 *
 * Sequence: darkness → the diya catches → embers lift → a spark takes on the
 * fuse → the rocket climbs → it breaks into a firework → the wordmark resolves
 * → the loader completes → warm light floods out into the homepage.
 *
 * Everything runs on one GSAP timeline so the whole thing can be scrubbed,
 * skipped or killed as a unit. The timeline only animates transforms and
 * opacity, which keeps it on the compositor for the full 3.6 seconds.
 *
 * It plays once per browser session — a reload inside the same tab gets a
 * 500ms curtain instead, because a three-second gate on every refresh stops
 * being cinematic by about the third time you see it.
 */
export const SplashScreen = ({ onFinish }) => {
  const rootRef = useRef(null);
  const scopeRef = useRef(null);
  const counterRef = useRef(null);
  const timelineRef = useRef(null);
  const finishedRef = useRef(false);
  const reduced = usePrefersReducedMotion();

  // Read-only during render; the write happens in an effect below so a
  // StrictMode double-render cannot mark the intro as already seen.
  const [short] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode — the full intro simply plays again */
    }
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  const skip = useCallback(() => {
    const tl = timelineRef.current;
    if (!tl) {
      finish();
      return;
    }
    // Jump to the flood-out rather than cutting hard — a skip should still
    // hand over to the page gracefully.
    tl.tweenTo(tl.duration(), { duration: 0.45, ease: 'power2.in', onComplete: finish });
  }, [finish]);

  useEffect(() => {
    if (reduced || short) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          rootRef.current,
          { opacity: 1 },
          { opacity: 0, duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 0.25, ease: 'power2.inOut', onComplete: finish },
        );
      }, rootRef);
      return () => ctx.revert();
    }

    const ctx = gsap.context((self) => {
      const q = self.selector;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: finish });
      timelineRef.current = tl;

      gsap.set(q('[data-fade-in]'), { opacity: 0 });
      gsap.set(q('[data-flame]'), { opacity: 0, scaleY: 0.1, scaleX: 0.6, transformOrigin: '50% 100%' });
      gsap.set(q('[data-diya-glow]'), { opacity: 0, scale: 0.5 });
      gsap.set(q('[data-ember]'), { opacity: 0, y: 0 });
      gsap.set(q('[data-rocket]'), { opacity: 0, y: 0 });
      gsap.set(q('[data-trail]'), { opacity: 0, scaleY: 0 });
      gsap.set(q('[data-burst]'), { opacity: 0, scale: 0.05 });
      gsap.set(q('[data-ray]'), { opacity: 0, scaleX: 0.05, transformOrigin: '0% 50%' });
      gsap.set(q('[data-spark]'), { opacity: 0, scale: 0 });
      gsap.set(q('[data-logo-word]'), { opacity: 0, y: 26, filter: 'blur(10px)' });
      gsap.set(q('[data-flood]'), { scale: 0, opacity: 1 });
      gsap.set(q('[data-bar-fill]'), { scaleX: 0, transformOrigin: '0% 50%' });

      /* 1 — the diya arrives out of the dark */
      tl.to(q('[data-diya]'), { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0.15)

        /* 2 — the wick catches */
        .to(q('[data-flame]'), { opacity: 1, scaleY: 1, scaleX: 1, duration: 0.6, ease: 'back.out(2.2)' }, 0.6)
        .to(q('[data-diya-glow]'), { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.6)
        .to(q('[data-flame]'), { scaleY: 1.08, scaleX: 0.94, duration: 0.32, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 1.05)

        /* 3 — embers lift off the flame */
        .to(
          q('[data-ember]'),
          {
            opacity: 1,
            y: -170,
            duration: 1.9,
            ease: 'sine.out',
            stagger: { each: 0.045, from: 'random' },
          },
          0.85,
        )
        .to(q('[data-ember]'), { opacity: 0, duration: 0.9, stagger: { each: 0.04, from: 'random' } }, 1.9)

        /* 4 — a spark takes on the fuse */
        .to(q('[data-spark]'), { opacity: 1, scale: 1.5, duration: 0.22, ease: 'power2.out' }, 1.45)
        .to(q('[data-spark]'), { scale: 0.7, opacity: 0.75, duration: 0.16, repeat: 1, yoyo: true }, 1.67)

        /* 5 — launch */
        .to(q('[data-rocket]'), { opacity: 1, duration: 0.08 }, 1.85)
        .to(q('[data-trail]'), { opacity: 0.9, scaleY: 1, duration: 0.45, ease: 'power1.out' }, 1.9)
        .to(q('[data-rocket]'), { y: -300, duration: 0.68, ease: 'power2.in' }, 1.9)
        .to(q('[data-rocket]'), { opacity: 0, duration: 0.12 }, 2.5)
        .to(q('[data-trail]'), { opacity: 0, scaleY: 0.2, duration: 0.35 }, 2.5)

        /* 6 — the break */
        .to(q('[data-burst]'), { opacity: 1, scale: 1, duration: 0.55, ease: 'expo.out' }, 2.56)
        .to(
          q('[data-ray]'),
          { opacity: 1, scaleX: 1, duration: 0.5, ease: 'expo.out', stagger: { each: 0.004, from: 'random' } },
          2.56,
        )
        .to(q('[data-ray]'), { opacity: 0, scaleX: 1.35, duration: 0.75, ease: 'power2.in' }, 2.95)
        .to(q('[data-burst]'), { opacity: 0, scale: 1.5, duration: 0.7 }, 2.95)

        /* 7 — the wordmark resolves out of the light */
        .to(
          q('[data-logo-word]'),
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, stagger: 0.09, ease: 'power3.out' },
          2.78,
        )
        .to(q('[data-tagline]'), { opacity: 1, y: 0, duration: 0.6 }, 3.05)
        .to(q('[data-loader]'), { opacity: 1, duration: 0.4 }, 2.9)

        /* 8 — the loader completes */
        .to(q('[data-bar-fill]'), { scaleX: 1, duration: 1.15, ease: 'power2.inOut' }, 2.35)
        .to(
          { value: 0 },
          {
            value: 100,
            duration: 1.15,
            ease: 'power2.inOut',
            onUpdate() {
              if (counterRef.current) {
                counterRef.current.textContent = String(Math.round(this.targets()[0].value)).padStart(2, '0');
              }
            },
          },
          2.35,
        )

        /* 9 — warm light floods outward */
        .to(q('[data-stage]'), { opacity: 0, scale: 1.06, duration: 0.5, ease: 'power2.in' }, 3.62)
        .to(q('[data-flood]'), { scale: 42, duration: 0.85, ease: 'power3.inOut' }, 3.55)

        /* 10 — hand over to the homepage */
        .to(rootRef.current, { opacity: 0, duration: 0.42, ease: 'power2.inOut' }, 4.05);
    }, scopeRef);

    return () => ctx.revert();
  }, [reduced, short, finish]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skip]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[300] overflow-hidden bg-[#120602]"
      role="status"
      aria-label={`Loading ${BRAND.name}`}
    >
      <div ref={scopeRef} className="absolute inset-0">
        {/* deep-night wash */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_78%,#3A1608_0%,#1A0803_45%,#0B0401_100%)]" />

        <div data-stage className="absolute inset-0">
          {/* ---------------- firework break ---------------- */}
          <div className="absolute left-1/2 top-[26%] h-0 w-0 -translate-x-1/2">
            <div
              data-burst
              className="absolute left-0 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,246,220,.95) 0%, rgba(255,213,106,.55) 28%, rgba(255,138,0,.2) 52%, transparent 70%)',
              }}
            />
            {Array.from({ length: RAYS }, (_, i) => (
              <span
                key={i}
                data-ray
                className="absolute left-0 top-0 h-[3px] origin-left rounded-full"
                style={{
                  width: i % 2 ? 150 : 200,
                  transform: `rotate(${(i / RAYS) * 360}deg)`,
                  background:
                    i % 3 === 0
                      ? 'linear-gradient(90deg,#FFF6DC,#FFD56A 45%,transparent)'
                      : i % 3 === 1
                        ? 'linear-gradient(90deg,#FFD56A,#FF8A00 50%,transparent)'
                        : 'linear-gradient(90deg,#FFB44B,#C84D0E 55%,transparent)',
                }}
              />
            ))}
          </div>

          {/* ---------------- rocket ---------------- */}
          <div className="absolute left-1/2 top-[54%] -translate-x-1/2">
            <div data-rocket className="relative">
              <svg width="30" height="64" viewBox="0 0 30 64" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="sp-rk" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFD56A" />
                    <stop offset="55%" stopColor="#FF8A00" />
                    <stop offset="100%" stopColor="#C84D0E" />
                  </linearGradient>
                </defs>
                <path d="M15 0 C22 10 26 21 26 30 L26 44 C26 47 24 49 21 49 L9 49 C6 49 4 47 4 44 L4 30 C4 21 8 10 15 0 Z" fill="url(#sp-rk)" />
                <path d="M4 36 L0 50 L4 47 Z" fill="#8C3A12" />
                <path d="M26 36 L30 50 L26 47 Z" fill="#8C3A12" />
                <circle cx="15" cy="26" r="5.5" fill="#FFF7EC" opacity=".92" />
                <rect x="4" y="40" width="22" height="3" fill="#FFD56A" opacity=".8" />
                <path d="M15 49 C19 55 20 60 15 64 C10 60 11 55 15 49 Z" fill="#FFF6DC" />
              </svg>
              <span
                data-trail
                className="absolute left-1/2 top-full h-40 w-[3px] origin-top -translate-x-1/2 rounded-full"
                style={{ background: 'linear-gradient(180deg,#FFD56A,rgba(255,138,0,.35),transparent)' }}
              />
            </div>
          </div>

          {/* ---------------- diya ---------------- */}
          <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2">
            <div
              data-diya-glow
              className="absolute left-1/2 top-[-70px] h-64 w-64 -translate-x-1/2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,180,70,.55) 0%, rgba(255,138,0,.18) 40%, transparent 68%)',
              }}
            />

            {/* embers */}
            {Array.from({ length: EMBERS }, (_, i) => {
              const offset = ((i * 37) % 100) - 50;
              const size = 2 + ((i * 13) % 4);
              return (
                <span
                  key={i}
                  data-ember
                  className="absolute rounded-full"
                  style={{
                    left: `calc(50% + ${offset * 1.5}px)`,
                    top: `${-14 - ((i * 11) % 40)}px`,
                    width: size,
                    height: size,
                    background: i % 3 === 0 ? '#FFF6DC' : i % 3 === 1 ? '#FFD56A' : '#FF8A00',
                    boxShadow: '0 0 8px rgba(255,180,70,.9)',
                  }}
                />
              );
            })}

            {/* fuse spark */}
            <span
              data-spark
              className="absolute left-1/2 top-[-46px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#FFF6DC]"
              style={{ boxShadow: '0 0 16px 4px rgba(255,213,106,.9)' }}
            />

            <svg data-diya width="220" height="150" viewBox="0 0 220 150" fill="none" aria-hidden="true" style={{ transform: 'translateY(28px)' }}>
              <defs>
                <linearGradient id="sp-clay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C97B45" />
                  <stop offset="55%" stopColor="#9A5327" />
                  <stop offset="100%" stopColor="#5E2C11" />
                </linearGradient>
                <linearGradient id="sp-flame" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#C84D0E" />
                  <stop offset="35%" stopColor="#FF8A00" />
                  <stop offset="75%" stopColor="#FFD56A" />
                  <stop offset="100%" stopColor="#FFF6DC" />
                </linearGradient>
                <radialGradient id="sp-oil">
                  <stop offset="0%" stopColor="#5E2C11" />
                  <stop offset="100%" stopColor="#3A1A08" />
                </radialGradient>
              </defs>

              {/* flame */}
              <g data-flame style={{ transformOrigin: '110px 70px' }}>
                <path
                  d="M110 6 C124 26 134 42 134 55 C134 70 123 80 110 80 C97 80 86 70 86 55 C86 42 96 26 110 6 Z"
                  fill="url(#sp-flame)"
                />
                <path
                  d="M110 30 C118 42 122 50 122 58 C122 67 117 73 110 73 C103 73 98 67 98 58 C98 50 102 42 110 30 Z"
                  fill="#FFF6DC"
                  opacity=".85"
                />
              </g>

              {/* wick */}
              <rect x="106" y="66" width="8" height="18" rx="4" fill="#3A1A08" />

              {/* bowl */}
              <path
                d="M18 84 C18 84 52 76 110 76 C168 76 202 84 202 84 C196 116 160 138 110 138 C60 138 24 116 18 84 Z"
                fill="url(#sp-clay)"
              />
              <ellipse cx="110" cy="84" rx="92" ry="13" fill="#D98F53" />
              <ellipse cx="110" cy="85" rx="74" ry="8" fill="url(#sp-oil)" />
              <path d="M30 92 C44 112 72 126 110 130" stroke="#FFD9AE" strokeWidth="3" opacity=".24" fill="none" strokeLinecap="round" />
              <ellipse cx="110" cy="142" rx="76" ry="7" fill="#FF8A00" opacity=".18" />
            </svg>
          </div>

          {/* ---------------- wordmark + loader ---------------- */}
          <div className="absolute inset-x-0 top-[30%] flex flex-col items-center px-6 text-center">
            <h1 className="flex flex-wrap items-baseline justify-center gap-x-3 font-display text-[clamp(2rem,9vw,4rem)] font-semibold leading-none text-[#FFF3DF]">
              <span data-logo-word className="inline-block">
                {BRAND.short}
              </span>
              <span
                data-logo-word
                className="inline-block bg-gradient-to-r from-gold-soft via-gold to-secondary-500 bg-clip-text text-transparent"
              >
                Crackers
              </span>
            </h1>
            <p
              data-tagline
              data-fade-in
              className="mt-4 translate-y-3 text-2xs font-semibold uppercase tracking-[.42em] text-gold/80"
            >
              {BRAND.tagline}
            </p>
          </div>

          <div
            data-loader
            data-fade-in
            className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-4 px-8"
          >
            <div className="h-[3px] w-56 overflow-hidden rounded-full bg-white/10 sm:w-72">
              <div
                data-bar-fill
                className="h-full w-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#C84D0E,#FF8A00,#FFD56A)' }}
              />
            </div>
            <div className="flex items-baseline gap-1 font-display text-sm tracking-[.3em] text-gold/85">
              <span ref={counterRef}>00</span>
              <span className="text-[10px]">%</span>
            </div>
          </div>
        </div>

        {/* warm light flooding out into the site */}
        <div
          data-flood
          className="absolute left-1/2 top-[26%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle,#FFF7EC 0%,#FFEBCB 55%,#FFE0B8 100%)' }}
        />
      </div>

      {!reduced && !short ? (
        <button
          type="button"
          onClick={skip}
          className="absolute bottom-6 right-6 z-10 rounded-full border border-white/15 px-4 py-2 text-2xs font-semibold uppercase tracking-[.2em] text-white/55 transition-all duration-300 hover:border-gold/50 hover:text-gold"
        >
          Skip intro
        </button>
      ) : null}
    </div>
  );
};

export default SplashScreen;
