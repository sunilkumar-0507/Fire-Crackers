import { forwardRef, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary:
    'bg-flame text-white shadow-glow hover:shadow-glow-lg hover:brightness-[1.06] active:brightness-95',
  gold: 'bg-gradient-to-br from-gold-soft via-gold to-gold-deep text-dark shadow-gold hover:brightness-[1.04]',
  dark: 'bg-dark text-bg shadow-lift hover:bg-[#3d1708]',
  outline:
    'border border-primary/25 bg-white/85 text-primary hover:border-primary/60 hover:bg-white hover:shadow-soft',
  ghost: 'text-ink/80 hover:bg-secondary-50 hover:text-primary',
  soft: 'bg-secondary-50 text-primary-600 hover:bg-secondary-100',
};

const SIZES = {
  xs: 'h-8 gap-1.5 rounded-full px-3 text-2xs font-semibold tracking-wide',
  sm: 'h-10 gap-2 rounded-full px-4 text-sm font-semibold',
  md: 'h-12 gap-2 rounded-full px-6 text-[15px] font-semibold',
  lg: 'h-14 gap-2.5 rounded-full px-8 text-base font-semibold',
  icon: 'h-11 w-11 rounded-full',
};

/**
 * The one button in the system.
 *
 * Renders as `<button>`, `<a>` or router `<Link>` depending on props, and
 * paints a material-style ripple from the exact click point. Ripples are held
 * in local state and self-remove on animation end, so no timers leak.
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    to,
    href,
    className,
    children,
    leftIcon,
    rightIcon,
    loading = false,
    disabled = false,
    ripple = true,
    onClick,
    ...rest
  },
  forwardedRef,
) {
  const [ripples, setRipples] = useState([]);
  const seed = useRef(0);

  const handleClick = useCallback(
    (event) => {
      if (ripple && !disabled && !loading) {
        const rect = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        seed.current += 1;
        setRipples((prev) => [
          ...prev,
          {
            key: seed.current,
            x: event.clientX - rect.left - size / 2,
            y: event.clientY - rect.top - size / 2,
            size,
          },
        ]);
      }
      onClick?.(event);
    },
    [ripple, disabled, loading, onClick],
  );

  const dropRipple = useCallback(
    (key) => setRipples((prev) => prev.filter((r) => r.key !== key)),
    [],
  );

  const classes = cn(
    'relative isolate inline-flex select-none items-center justify-center overflow-hidden',
    'transition-[transform,box-shadow,background-color,filter] duration-300 ease-luxe',
    'will-change-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    loading && 'pointer-events-none',
    className,
  );

  const inner = (
    <>
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}
      {children ? <span className="relative z-10">{children}</span> : null}
      {rightIcon}
      {ripples.map((r) => (
        <span
          key={r.key}
          onAnimationEnd={() => dropRipple(r.key)}
          className="pointer-events-none absolute z-0 animate-ripple-out rounded-full bg-white/45"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </>
  );

  if (to) {
    return (
      <Link ref={forwardedRef} to={to} className={classes} onClick={handleClick} {...rest}>
        {inner}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        ref={forwardedRef}
        href={href}
        className={classes}
        onClick={handleClick}
        rel="noreferrer"
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      ref={forwardedRef}
      type="button"
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      {...rest}
    >
      {inner}
    </button>
  );
});

export default Button;
