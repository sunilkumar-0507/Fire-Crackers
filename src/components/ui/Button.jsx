import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/**
 * `primary` is amber with dark text (9.7:1) rather than the previous orange
 * gradient with white text, which measured 2.4:1 against its own lightest
 * stop — the most-clicked control in the shop was failing AA outright.
 */
const VARIANTS = {
  primary: 'bg-flame text-dark shadow-glow hover:brightness-[1.04] active:brightness-95',
  gold: 'bg-secondary-300 text-dark shadow-soft hover:bg-secondary-200',
  dark: 'bg-dark text-bg shadow-soft hover:bg-primary-900',
  outline: 'border border-primary/35 bg-card text-primary-700 hover:border-primary hover:bg-primary-50',
  ghost: 'text-ink hover:bg-secondary-50 hover:text-primary-700',
  soft: 'bg-secondary-50 text-primary-700 hover:bg-secondary-100',
};

/**
 * Every size except `xs` clears the 44px minimum touch target. `xs` is only
 * ever used for inline chips inside a larger hit area.
 */
const SIZES = {
  xs: 'h-8 gap-1.5 rounded-full px-3 text-2xs font-semibold',
  sm: 'h-11 gap-2 rounded-full px-4 text-sm font-semibold',
  md: 'h-12 gap-2 rounded-full px-6 text-[15px] font-semibold',
  lg: 'h-[52px] gap-2.5 rounded-full px-7 text-base font-semibold',
  icon: 'h-11 w-11 rounded-full',
};

/**
 * The one button in the system.
 *
 * Renders as `<button>`, `<a>` or router `<Link>` depending on props. Feedback
 * is a colour change and a small press-down on `:active` — no ripple, no lift.
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
    onClick,
    ...rest
  },
  forwardedRef,
) {
  const classes = cn(
    'relative isolate inline-flex select-none items-center justify-center overflow-hidden',
    'transition-[box-shadow,background-color,border-color,filter] duration-200 ease-luxe',
    // No hover lift. Every button on the page rising half a step under the
    // cursor reads as the layout twitching, not as feedback.
    'active:scale-[.98]',
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
    </>
  );

  if (to) {
    return (
      <Link ref={forwardedRef} to={to} className={classes} onClick={onClick} {...rest}>
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
        onClick={onClick}
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
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {inner}
    </button>
  );
});

export default Button;
