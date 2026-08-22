import { cn } from '@/utils/cn';

/* --------------------------- illustrations -------------------------------- */

const Illustrations = {
  /** An open, empty crate — used when a filter set returns nothing. */
  crate: (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="es-crate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD9AE" />
          <stop offset="100%" stopColor="#E9A96A" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="158" rx="76" ry="11" fill="#C84D0E" opacity="0.1" />
      <path d="M46 76 L174 76 L162 152 C161.4 155.4 158.5 158 155 158 L65 158 C61.5 158 58.6 155.4 58 152 Z" fill="url(#es-crate)" />
      <rect x="40" y="66" width="140" height="16" rx="8" fill="#C88A4E" />
      <path d="M74 96 L146 96" stroke="#B9782F" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M78 118 L142 118" stroke="#B9782F" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <path d="M62 44 L74 24" stroke="#FFB44B" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 38 L110 14" stroke="#FF8A00" strokeWidth="4" strokeLinecap="round" />
      <path d="M158 44 L146 24" stroke="#FFD56A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="86" cy="34" r="3.5" fill="#FFD56A" />
      <circle cx="136" cy="30" r="3" fill="#FF8A00" />
    </svg>
  ),

  /** A magnifier over a spent sparkler — no search results. */
  search: (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="es-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF7EC" />
          <stop offset="100%" stopColor="#FFE0B8" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="160" rx="70" ry="10" fill="#C84D0E" opacity="0.1" />
      <circle cx="98" cy="80" r="46" fill="url(#es-lens)" stroke="#E2762F" strokeWidth="7" />
      <path d="M132 114 L172 154" stroke="#C84D0E" strokeWidth="13" strokeLinecap="round" />
      <path d="M78 68 L118 96" stroke="#C84D0E" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
      <path d="M118 68 L78 96" stroke="#C84D0E" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
      <circle cx="52" cy="42" r="4" fill="#FFD56A" />
      <circle cx="168" cy="58" r="5" fill="#FF8A00" opacity="0.7" />
      <circle cx="42" cy="118" r="3.5" fill="#FFB44B" opacity="0.8" />
    </svg>
  ),

  /** An empty basket with a lone sparkler — empty cart. */
  cart: (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="es-bag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE0B8" />
          <stop offset="100%" stopColor="#F2A45C" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="162" rx="72" ry="10" fill="#C84D0E" opacity="0.1" />
      <path d="M58 74 L162 74 L152 154 C151.5 157.4 148.6 160 145 160 L75 160 C71.4 160 68.5 157.4 68 154 Z" fill="url(#es-bag)" />
      <path d="M86 78 L86 56 C86 42 96 32 110 32 C124 32 134 42 134 56 L134 78" fill="none" stroke="#C84D0E" strokeWidth="7" strokeLinecap="round" />
      <line x1="110" y1="136" x2="146" y2="92" stroke="#9A9A9A" strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={146 + Math.cos(a) * 4}
            y1={92 + Math.sin(a) * 4}
            x2={146 + Math.cos(a) * (12 + (i % 3) * 6)}
            y2={92 + Math.sin(a) * (12 + (i % 3) * 6)}
            stroke={i % 2 ? '#FF8A00' : '#FFD56A'}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="146" cy="92" r="6" fill="#FFD56A" />
    </svg>
  ),

  /** A cracker that failed to light — generic error. */
  dud: (
    <svg viewBox="0 0 220 180" className="h-full w-full" aria-hidden="true">
      <ellipse cx="110" cy="160" rx="66" ry="10" fill="#C84D0E" opacity="0.1" />
      <rect x="86" y="66" width="48" height="92" rx="10" fill="#E2762F" />
      <rect x="86" y="94" width="48" height="22" fill="#FFF7EC" />
      <ellipse cx="110" cy="66" rx="24" ry="8" fill="#FFB44B" />
      <path d="M110 58 C110 40 124 34 138 38" stroke="#8C3A12" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M132 30 L146 44 M146 30 L132 44" stroke="#806253" strokeWidth="4" strokeLinecap="round" />
      <path d="M62 100 C54 92 54 80 62 74" stroke="#E9A96A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M160 100 C168 92 168 80 160 74" stroke="#E9A96A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  ),
};

/**
 * Illustrated empty state. Every list, grid and drawer in the app funnels
 * through this so a zero-result screen never looks like a broken one.
 */
export const EmptyState = ({
  illustration = 'crate',
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center',
      compact ? 'gap-3 px-6 py-10' : 'gap-4 px-6 py-16',
      className,
    )}
  >
    <div className={cn('w-full', compact ? 'max-w-[150px]' : 'max-w-[230px]')}>
      {Illustrations[illustration] ?? Illustrations.crate}
    </div>

    <h3 className={cn('font-display text-dark', compact ? 'text-lg' : 'text-2xl')}>{title}</h3>
    {description ? (
      <p className={cn('max-w-sm text-muted', compact ? 'text-sm' : 'text-[15px] leading-relaxed')}>
        {description}
      </p>
    ) : null}

    {action || secondaryAction ? (
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {action}
        {secondaryAction}
      </div>
    ) : null}
  </div>
);

export default EmptyState;
