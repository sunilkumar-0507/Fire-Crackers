import { useLocation } from 'react-router-dom';
import { ArrowUp } from '@/components/ui/icons';
import { useScrolled } from '@/hooks/useScrolled';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';
import { floatingOffset } from '@/utils/nav';

/** Appears once you are well down the page; scrolls back with a progress ring. */
export const ScrollToTopButton = () => {
  const { pathname } = useLocation();
  const visible = useScrolled(900);
  const reduced = usePrefersReducedMotion();

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      }
      aria-label="Back to top"
      className={cn(
        'group fixed right-4 z-40 grid h-12 w-12 place-items-center rounded-full border border-line bg-card text-primary shadow-lift backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-card lg:right-8',
        floatingOffset(pathname),
      )}
    >
      <ArrowUp size={19} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
};

export default ScrollToTopButton;
