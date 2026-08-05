import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useCountdown } from '@/hooks/useCountdown';

const Unit = ({ value, label, tone }) => (
  <div className="flex flex-col items-center">
    <div
      className={cn(
        'relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl font-display text-base font-semibold tabular-nums xs:h-12 xs:w-12 xs:text-lg sm:h-14 sm:w-14 sm:text-xl',
        tone === 'dark' ? 'bg-white/12 text-bg' : 'bg-white text-dark shadow-soft',
      )}
    >
      {/* The digit slides up on change, so seconds tick rather than blink. */}
      <motion.span
        key={value}
        initial={{ y: '-70%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="block"
      >
        {value}
      </motion.span>
    </div>
    <span
      className={cn(
        'mt-1.5 text-[9px] font-semibold uppercase tracking-[.16em]',
        tone === 'dark' ? 'text-bg/50' : 'text-muted',
      )}
    >
      {label}
    </span>
  </div>
);

/** Days / hours / minutes / seconds strip used on offer cards and banners. */
export const Countdown = ({ deadline, tone = 'light', className }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(deadline);

  if (expired) {
    return (
      <p className={cn('text-2xs font-semibold uppercase tracking-[.16em] text-muted', className)}>
        Offer closed
      </p>
    );
  }

  return (
    <div className={cn('flex items-start gap-1.5 xs:gap-2 sm:gap-2.5', className)}>
      <Unit value={days} label="Days" tone={tone} />
      <Unit value={hours} label="Hrs" tone={tone} />
      <Unit value={minutes} label="Min" tone={tone} />
      <Unit value={seconds} label="Sec" tone={tone} />
    </div>
  );
};

export default Countdown;
