import { memo, useId, useMemo } from 'react';
import { cn } from '@/utils/cn';

/**
 * Procedural SVG illustrations for every cracker type.
 *
 * The catalogue ships no bitmaps on purpose: vector art scales to any card
 * size, weighs nothing, needs no network round-trip and can never show a
 * broken-image icon. `resolveArt()` in `utils/image.js` maps a product's
 * `images` entry (e.g. "rocket/2") onto a type + variant pair here.
 *
 * Swapping in real photography later means changing `ProductImage`, not this.
 */

/* Deterministic PRNG so spark positions are stable across re-renders. */
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* Four colourways per art type, indexed by the variant in the image id. */
const PALETTES = {
  rocket: [
    { a: '#FF8A00', b: '#C84D0E', c: '#FFD56A', d: '#8C3A12' },
    { a: '#FF6B6B', b: '#A6357A', c: '#FFC2E0', d: '#5E1E4A' },
    { a: '#FFB44B', b: '#E5B23C', c: '#FFF0C4', d: '#7F5A10' },
    { a: '#4FB0C6', b: '#0F7B6C', c: '#BDEDE4', d: '#0A4B43' },
  ],
  flowerpot: [
    { a: '#FFD56A', b: '#FF8A00', c: '#C84D0E', d: '#8C3A12' },
    { a: '#B8F2E6', b: '#3AAE9B', c: '#0F7B6C', d: '#0A4B43' },
    { a: '#FFC2E0', b: '#D9539B', c: '#A6357A', d: '#5E1E4A' },
    { a: '#FFF0C4', b: '#FFD56A', c: '#E5B23C', d: '#8A6A14' },
  ],
  sparkler: [
    { a: '#FFF6DC', b: '#FFD56A', c: '#FF8A00', d: '#C84D0E' },
    { a: '#EAFBFF', b: '#9FE3F5', c: '#4FB0C6', d: '#0F6E85' },
    { a: '#FFE9F4', b: '#FFC2E0', c: '#D9539B', d: '#A6357A' },
    { a: '#FFFFFF', b: '#FFF0C4', c: '#E5B23C', d: '#8A6A14' },
  ],
  chakkar: [
    { a: '#FFD56A', b: '#FF8A00', c: '#C84D0E', d: '#5E2408' },
    { a: '#C7F0D8', b: '#4CBF7A', c: '#1E8A4C', d: '#0C4A29' },
    { a: '#FFC2E0', b: '#E86FB0', c: '#A6357A', d: '#5E1E4A' },
    { a: '#CFE4FF', b: '#6BA8F5', c: '#2F5FB8', d: '#17356B' },
  ],
  aerial: [
    { a: '#FFD56A', b: '#FF8A00', c: '#C84D0E', d: '#3A1607' },
    { a: '#D8C7FF', b: '#9B7BF0', c: '#6238C4', d: '#2E1667' },
    { a: '#B8F2E6', b: '#3AAE9B', c: '#0F7B6C', d: '#08332E' },
    { a: '#FFC9C2', b: '#F2705C', c: '#B4432E', d: '#4A180F' },
  ],
  bomb: [
    { a: '#F2705C', b: '#C84D0E', c: '#8C3A12', d: '#2C0F05' },
    { a: '#FFD56A', b: '#E5B23C', c: '#8A6A14', d: '#2C0F05' },
    { a: '#9FE3F5', b: '#4FB0C6', c: '#0F6E85', d: '#06303A' },
    { a: '#E7C7A6', b: '#B98B5E', c: '#7A5734', d: '#2C1B0C' },
  ],
  kids: [
    { a: '#FFC2E0', b: '#D9539B', c: '#A6357A', d: '#FFD56A' },
    { a: '#B8F2E6', b: '#3AAE9B', c: '#0F7B6C', d: '#FFD56A' },
    { a: '#D8C7FF', b: '#9B7BF0', c: '#6238C4', d: '#FFB44B' },
    { a: '#FFE0B8', b: '#FF9E1E', c: '#C84D0E', d: '#4FB0C6' },
  ],
  giftbox: [
    { a: '#FFD56A', b: '#FF8A00', c: '#C84D0E', d: '#8C3A12' },
    { a: '#FFC2E0', b: '#D9539B', c: '#A6357A', d: '#5E1E4A' },
    { a: '#B8F2E6', b: '#3AAE9B', c: '#0F7B6C', d: '#0A4B43' },
    { a: '#D8C7FF', b: '#9B7BF0', c: '#6238C4', d: '#2E1667' },
  ],
};

/* -------------------------------------------------------------------------- */
/* Shared building blocks                                                      */
/* -------------------------------------------------------------------------- */

const Sparks = ({ rand, count, cx, cy, spread, palette, minR = 1, maxR = 3.2 }) =>
  Array.from({ length: count }, (_, i) => {
    const angle = rand() * Math.PI * 2;
    const dist = (0.35 + rand() * 0.65) * spread;
    const r = minR + rand() * (maxR - minR);
    return (
      <circle
        key={i}
        cx={cx + Math.cos(angle) * dist}
        cy={cy + Math.sin(angle) * dist * 0.86}
        r={r}
        fill={i % 3 === 0 ? palette.a : i % 3 === 1 ? palette.b : palette.c}
        opacity={0.35 + rand() * 0.5}
      />
    );
  });

const Burst = ({ cx, cy, r, rays, palette, id }) => (
  <g>
    <circle cx={cx} cy={cy} r={r * 1.05} fill={`url(#${id})`} opacity="0.5" />
    {Array.from({ length: rays }, (_, i) => {
      const angle = (i / rays) * Math.PI * 2;
      const len = r * (i % 2 ? 0.72 : 1);
      return (
        <g key={i}>
          <line
            x1={cx + Math.cos(angle) * r * 0.16}
            y1={cy + Math.sin(angle) * r * 0.16}
            x2={cx + Math.cos(angle) * len}
            y2={cy + Math.sin(angle) * len}
            stroke={i % 2 ? palette.b : palette.a}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle
            cx={cx + Math.cos(angle) * len}
            cy={cy + Math.sin(angle) * len}
            r={1.9}
            fill={palette.a}
          />
        </g>
      );
    })}
  </g>
);

/* -------------------------------------------------------------------------- */
/* Art types                                                                   */
/* -------------------------------------------------------------------------- */

const artRenderers = {
  rocket: (p, ids, rand) => (
    <>
      {/* guide stick */}
      <rect x="116" y="126" width="8" height="96" rx="4" fill={`url(#${ids.wood})`} />
      {/* fins */}
      <path d="M96 108 L78 142 L96 136 Z" fill={p.d} />
      <path d="M144 108 L162 142 L144 136 Z" fill={p.d} />
      {/* body */}
      <path
        d="M120 18 C136 42 148 68 148 92 L148 130 C148 136 143 140 137 140 L103 140 C97 140 92 136 92 130 L92 92 C92 68 104 42 120 18 Z"
        fill={`url(#${ids.body})`}
      />
      {/* printed bands */}
      <rect x="92" y="96" width="56" height="7" fill={p.c} opacity="0.9" />
      <rect x="92" y="118" width="56" height="4" fill={p.c} opacity="0.65" />
      {/* label */}
      <circle cx="120" cy="80" r="17" fill="#FFF7EC" opacity="0.94" />
      <circle cx="120" cy="80" r="17" fill="none" stroke={p.b} strokeWidth="2" />
      <path
        d="M120 70 L123.2 77.2 L131 78 L125.2 83.2 L126.9 91 L120 87 L113.1 91 L114.8 83.2 L109 78 L116.8 77.2 Z"
        fill={p.b}
      />
      {/* nose highlight */}
      <path d="M120 18 C112 32 106 48 103 64 L110 64 C113 48 116 32 120 18 Z" fill="#FFFFFF" opacity="0.28" />
      {/* thrust */}
      <path d="M120 142 C132 158 137 176 129 196 C125 182 122 172 120 166 C118 172 115 182 111 196 C103 176 108 158 120 142 Z" fill={`url(#${ids.flame})`} />
      <path d="M120 148 C127 160 130 172 125 186 C123 176 121 170 120 166 C119 170 117 176 115 186 C110 172 113 160 120 148 Z" fill={p.a} opacity="0.95" />
      <Sparks rand={rand} count={8} cx={120} cy={190} spread={54} palette={p} />
    </>
  ),

  flowerpot: (p, ids, rand) => (
    <>
      {/* fountain spray */}
      <path
        d="M120 150 C86 118 70 84 74 44 C92 78 104 100 120 116 C136 100 148 78 166 44 C170 84 154 118 120 150 Z"
        fill={`url(#${ids.spray})`}
        opacity="0.85"
      />
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const angle = (-100 + t * 200) * (Math.PI / 180);
        const dist = 44 + rand() * 62;
        return (
          <circle
            key={i}
            cx={120 + Math.sin(angle) * dist}
            cy={150 - Math.cos(angle) * dist * 0.94}
            r={1.2 + rand() * 2.6}
            fill={i % 3 === 0 ? p.a : i % 3 === 1 ? p.b : p.c}
            opacity={0.45 + rand() * 0.5}
          />
        );
      })}
      {/* pot */}
      <path d="M88 152 L152 152 L142 208 C141.4 211.4 138.5 214 135 214 L105 214 C101.5 214 98.6 211.4 98 208 Z" fill={`url(#${ids.clay})`} />
      <rect x="83" y="143" width="74" height="14" rx="7" fill={p.d} />
      <rect x="83" y="143" width="74" height="6" rx="3" fill="#FFFFFF" opacity="0.2" />
      <path d="M100 160 L104 208 L112 208 L107 160 Z" fill="#FFFFFF" opacity="0.18" />
      {/* base glow */}
      <ellipse cx="120" cy="216" rx="52" ry="8" fill={p.b} opacity="0.22" />
    </>
  ),

  sparkler: (p, ids, rand) => (
    <>
      <circle cx="150" cy="84" r="62" fill={`url(#${ids.glow})`} />
      {/* handle */}
      <line x1="52" y1="200" x2="132" y2="106" stroke={`url(#${ids.wire})`} strokeWidth="5" strokeLinecap="round" />
      <line x1="132" y1="106" x2="150" y2="84" stroke={p.c} strokeWidth="5" strokeLinecap="round" />
      {/* burning head */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + rand() * 0.18;
        const len = 20 + rand() * 40;
        return (
          <line
            key={i}
            x1={150 + Math.cos(angle) * 5}
            y1={84 + Math.sin(angle) * 5}
            x2={150 + Math.cos(angle) * len}
            y2={84 + Math.sin(angle) * len}
            stroke={i % 4 === 0 ? p.a : i % 4 === 1 ? p.b : p.c}
            strokeWidth={i % 3 === 0 ? 2.1 : 1.2}
            strokeLinecap="round"
            opacity={0.55 + rand() * 0.45}
          />
        );
      })}
      <circle cx="150" cy="84" r="11" fill={p.a} />
      <circle cx="150" cy="84" r="5.5" fill="#FFFFFF" />
      <Sparks rand={rand} count={9} cx={150} cy={84} spread={78} palette={p} maxR={2.4} />
    </>
  ),

  chakkar: (p, ids, rand) => {
    // Flattened Archimedean spiral — reads as a wound chakkar seen at an angle.
    const spiral = Array.from({ length: 72 }, (_, i) => {
      const t = (i / 71) * Math.PI * 7;
      const r = 8 + t * 8.2;
      return `${(120 + Math.cos(t) * r).toFixed(1)},${(126 + Math.sin(t) * r * 0.78).toFixed(1)}`;
    }).join(' ');

    return (
      <>
        <ellipse cx="120" cy="126" rx="98" ry="78" fill={`url(#${ids.glow})`} opacity="0.6" />
        {/* motion arcs */}
        {[1, 0.84, 0.68].map((s, i) => (
          <ellipse
            key={i}
            cx="120"
            cy="126"
            rx={94 * s}
            ry={74 * s}
            fill="none"
            stroke={i === 0 ? p.a : p.b}
            strokeWidth="1.4"
            strokeDasharray={i === 0 ? '3 12' : '2 9'}
            opacity={0.5 - i * 0.12}
          />
        ))}
        <polyline points={spiral} fill="none" stroke={p.d} strokeWidth="7.5" strokeLinecap="round" />
        <polyline points={spiral} fill="none" stroke={`url(#${ids.coil})`} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="120" cy="126" r="9" fill={p.d} />
        <circle cx="120" cy="126" r="4" fill={p.a} />
        <Sparks rand={rand} count={12} cx={120} cy={126} spread={104} palette={p} maxR={2.8} />
      </>
    );
  },

  aerial: (p, ids, rand) => (
    <>
      {/* sky bursts */}
      <Burst cx={62} cy={54} r={30} rays={10} palette={p} id={ids.glow} />
      <Burst cx={170} cy={40} r={24} rays={8} palette={p} id={ids.glow} />
      <Burst cx={128} cy={92} r={19} rays={8} palette={p} id={ids.glow} />
      {/* launch cake */}
      <rect x="62" y="148" width="116" height="62" rx="8" fill={`url(#${ids.body})`} />
      <rect x="62" y="148" width="116" height="13" rx="6" fill={p.d} />
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={74 + i * 16} cy={154.5} r="4.6" fill={p.c} opacity="0.85" />
      ))}
      <rect x="62" y="176" width="116" height="9" fill={p.c} opacity="0.55" />
      <rect x="62" y="192" width="116" height="4" fill={p.a} opacity="0.4" />
      <text
        x="120"
        y="173"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#FFF7EC"
        opacity="0.9"
        fontFamily="Inter Variable, Inter, sans-serif"
      >
        SKY SHOW
      </text>
      {/* fuse */}
      <path d="M178 158 C192 152 198 142 194 132" stroke={p.d} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="194" cy="130" r="4" fill={p.a} />
      <ellipse cx="120" cy="214" rx="66" ry="7" fill={p.c} opacity="0.2" />
      <Sparks rand={rand} count={7} cx={120} cy={70} spread={98} palette={p} maxR={2.2} />
    </>
  ),

  bomb: (p, ids, rand) => (
    <>
      <ellipse cx="120" cy="140" rx="82" ry="82" fill={`url(#${ids.glow})`} opacity="0.5" />
      {/* body */}
      <rect x="80" y="98" width="80" height="94" rx="10" fill={`url(#${ids.body})`} />
      <ellipse cx="120" cy="98" rx="40" ry="11" fill={p.a} />
      <ellipse cx="120" cy="192" rx="40" ry="11" fill={p.c} />
      {/* printed wrap */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={88 + i * 18} y="98" width="7" height="94" fill={p.c} opacity="0.35" />
      ))}
      <rect x="80" y="126" width="80" height="24" fill="#FFF7EC" opacity="0.92" />
      <text
        x="120"
        y="143"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill={p.c}
        fontFamily="Inter Variable, Inter, sans-serif"
        letterSpacing="1"
      >
        ATOM
      </text>
      <rect x="80" y="98" width="18" height="94" fill="#FFFFFF" opacity="0.12" />
      {/* fuse + spark */}
      <path d="M120 98 C120 78 132 68 148 64" stroke={p.d} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="150" cy="63" r="8" fill={p.a} opacity="0.5" />
      <circle cx="150" cy="63" r="4.2" fill="#FFF6DC" />
      <Sparks rand={rand} count={8} cx={150} cy={62} spread={40} palette={p} maxR={2.2} />
    </>
  ),

  kids: (p, ids, rand) => (
    <>
      <circle cx="120" cy="112" r="76" fill={`url(#${ids.glow})`} opacity="0.55" />
      {/* smoke puff */}
      <circle cx="104" cy="76" r="26" fill={p.a} opacity="0.72" />
      <circle cx="138" cy="66" r="20" fill={p.b} opacity="0.6" />
      <circle cx="128" cy="92" r="23" fill={p.d} opacity="0.5" />
      <circle cx="96" cy="98" r="15" fill={p.a} opacity="0.5" />
      {/* stick */}
      <rect x="112" y="112" width="14" height="76" rx="7" fill={`url(#${ids.body})`} />
      <rect x="112" y="128" width="14" height="7" fill="#FFF7EC" opacity="0.85" />
      <rect x="112" y="146" width="14" height="7" fill="#FFF7EC" opacity="0.6" />
      <rect x="112" y="112" width="14" height="10" rx="5" fill={p.d} />
      {/* coiled snake novelty */}
      <path
        d="M56 190 C56 176 78 176 78 190 C78 200 62 200 62 191 C62 186 71 186 71 191"
        stroke={p.c}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* confetti */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = 26 + rand() * 190;
        const y = 40 + rand() * 170;
        const size = 2.4 + rand() * 4;
        const fill = [p.a, p.b, p.c, p.d][i % 4];
        return i % 2 ? (
          <circle key={i} cx={x} cy={y} r={size / 1.7} fill={fill} opacity={0.5 + rand() * 0.45} />
        ) : (
          <rect
            key={i}
            x={x}
            y={y}
            width={size}
            height={size}
            rx="1"
            fill={fill}
            opacity={0.5 + rand() * 0.45}
            transform={`rotate(${rand() * 90} ${x} ${y})`}
          />
        );
      })}
      <ellipse cx="120" cy="194" rx="54" ry="7" fill={p.c} opacity="0.18" />
    </>
  ),

  giftbox: (p, ids, rand) => (
    <>
      <circle cx="120" cy="120" r="86" fill={`url(#${ids.glow})`} opacity="0.5" />
      {/* escaping sparkles */}
      <Sparks rand={rand} count={11} cx={120} cy={72} spread={80} palette={p} maxR={3} />
      {/* box */}
      <rect x="64" y="112" width="112" height="94" rx="8" fill={`url(#${ids.body})`} />
      <rect x="110" y="112" width="20" height="94" fill={p.c} opacity="0.92" />
      <rect x="64" y="112" width="112" height="8" fill="#000000" opacity="0.08" />
      {/* lid, lifted slightly */}
      <g transform="rotate(-4 120 104)">
        <rect x="56" y="86" width="128" height="30" rx="7" fill={`url(#${ids.lid})`} />
        <rect x="110" y="86" width="20" height="30" fill={p.c} opacity="0.92" />
        <rect x="56" y="86" width="128" height="9" rx="4" fill="#FFFFFF" opacity="0.22" />
      </g>
      {/* bow */}
      <path d="M120 84 C104 84 92 74 96 64 C100 55 116 60 120 84 Z" fill={p.c} />
      <path d="M120 84 C136 84 148 74 144 64 C140 55 124 60 120 84 Z" fill={p.b} />
      <circle cx="120" cy="80" r="7" fill={p.a} />
      <ellipse cx="120" cy="210" rx="62" ry="8" fill={p.c} opacity="0.2" />
    </>
  ),
};

/* -------------------------------------------------------------------------- */

const gradientDefs = (p, ids) => (
  <defs>
    <radialGradient id={ids.glow}>
      <stop offset="0%" stopColor={p.a} stopOpacity="0.75" />
      <stop offset="55%" stopColor={p.b} stopOpacity="0.22" />
      <stop offset="100%" stopColor={p.b} stopOpacity="0" />
    </radialGradient>
    <linearGradient id={ids.body} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={p.a} />
      <stop offset="52%" stopColor={p.b} />
      <stop offset="100%" stopColor={p.c} />
    </linearGradient>
    <linearGradient id={ids.lid} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={p.b} />
      <stop offset="100%" stopColor={p.c} />
    </linearGradient>
    <linearGradient id={ids.clay} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={p.c} />
      <stop offset="100%" stopColor={p.d} />
    </linearGradient>
    <linearGradient id={ids.flame} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFF6DC" />
      <stop offset="35%" stopColor={p.c} />
      <stop offset="100%" stopColor={p.b} stopOpacity="0.1" />
    </linearGradient>
    <linearGradient id={ids.spray} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stopColor={p.b} stopOpacity="0.8" />
      <stop offset="60%" stopColor={p.a} stopOpacity="0.35" />
      <stop offset="100%" stopColor={p.a} stopOpacity="0" />
    </linearGradient>
    <linearGradient id={ids.wire} x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stopColor="#8A8A8A" />
      <stop offset="100%" stopColor="#D8D8D8" />
    </linearGradient>
    <linearGradient id={ids.wood} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="#B98B5E" />
      <stop offset="50%" stopColor="#E7C7A6" />
      <stop offset="100%" stopColor="#8A6440" />
    </linearGradient>
    <linearGradient id={ids.coil} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={p.a} />
      <stop offset="50%" stopColor={p.b} />
      <stop offset="100%" stopColor={p.a} />
    </linearGradient>
  </defs>
);

/**
 * @param {'rocket'|'flowerpot'|'sparkler'|'chakkar'|'aerial'|'bomb'|'kids'|'giftbox'} type
 * @param {number} variant 1–4, selects the colourway
 */
export const CrackerArt = memo(function CrackerArt({
  type = 'rocket',
  variant = 1,
  className,
  title,
  ...rest
}) {
  const uid = useId().replace(/:/g, '');
  const safeType = artRenderers[type] ? type : 'rocket';
  const palette = PALETTES[safeType][(variant - 1) % 4] ?? PALETTES[safeType][0];

  const ids = useMemo(() => {
    const keys = ['glow', 'body', 'lid', 'clay', 'flame', 'spray', 'wire', 'wood', 'coil'];
    return Object.fromEntries(keys.map((k) => [k, `${uid}-${k}`]));
  }, [uid]);

  // Seeded per type+variant, so the same art always draws the same sparks
  // no matter how many times React re-renders it.
  const content = useMemo(
    () => artRenderers[safeType](palette, ids, mulberry32(safeType.length * 7919 + variant * 104729)),
    [safeType, variant, palette, ids],
  );

  return (
    <svg
      viewBox="0 0 240 240"
      className={cn('h-full w-full', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMid meet"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {gradientDefs(palette, ids)}
      {content}
    </svg>
  );
});

export default CrackerArt;
