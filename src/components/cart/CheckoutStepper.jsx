import { Fragment } from 'react';
import { Check } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { CHECKOUT_STEPS } from '@/constants';

/**
 * Progress rail for checkout. Completed steps are clickable so people can go
 * back and fix a typo without losing what they have already filled in.
 */
export const CheckoutStepper = ({ current, furthest, onJump, className }) => (
  <ol className={cn('flex items-start', className)}>
    {CHECKOUT_STEPS.map((step, index) => {
      const done = index < current;
      const active = index === current;
      const reachable = index <= furthest;

      return (
        <Fragment key={step.id}>
          <li className="flex min-w-0 flex-col items-center gap-2.5 text-center">
            <button
              type="button"
              disabled={!reachable || active}
              onClick={() => onJump(index)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold transition-all duration-400 ease-luxe',
                done && 'bg-emerald-500 text-white hover:scale-110',
                active && 'bg-flame text-dark shadow-glow',
                !done && !active && 'border border-line bg-card text-muted',
                !reachable && 'cursor-not-allowed',
              )}
            >
              {active ? (
                <span className="absolute -inset-1.5 rounded-full border-2 border-secondary-300" />
              ) : null}
              <span className="relative">
                {done ? <Check size={17} /> : index + 1}
              </span>
            </button>

            <span className="hidden sm:block">
              <span
                className={cn(
                  'block text-xs font-semibold transition-colors',
                  active ? 'text-primary' : done ? 'text-dark' : 'text-muted',
                )}
              >
                {step.label}
              </span>
              <span className="mt-0.5 block text-[10px] text-muted">{step.hint}</span>
            </span>
          </li>

          {index < CHECKOUT_STEPS.length - 1 ? (
            <li aria-hidden="true" className="mx-2 mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-line sm:mx-3">
              <span className="block h-full origin-left bg-emerald-500" />
            </li>
          ) : null}
        </Fragment>
      );
    })}
  </ol>
);

export default CheckoutStepper;
