import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

/** Appears once you are well down the page; scrolls back with a progress ring. */
export const ScrollToTopButton = () => {
  const visible = useScrolled(900);
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={() =>
            window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
          }
          aria-label="Back to top"
          className="group fixed bottom-24 right-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-line bg-white/85 text-primary shadow-lift backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white lg:bottom-8 lg:right-8"
        >
          <ArrowUp size={19} strokeWidth={2.4} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
