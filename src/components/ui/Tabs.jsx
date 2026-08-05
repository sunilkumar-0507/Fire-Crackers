import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { EASE } from '@/animations/variants';

/**
 * Animated tab set. The active pill is a shared `layoutId`, so it slides
 * between tabs instead of cutting — used on the product detail page.
 */
export const Tabs = ({ tabs, initial = 0, className, panelClassName }) => {
  const [active, setActive] = useState(initial);
  const uid = useId().replace(/:/g, '');
  const current = tabs[active];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Product information"
        className="hide-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-white/85 p-1.5"
      >
        {tabs.map((tab, index) => {
          const isActive = index === active;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`${uid}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${uid}-panel-${tab.id}`}
              onClick={() => setActive(index)}
              className={cn(
                'relative shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300 sm:px-5',
                isActive ? 'text-white' : 'text-muted hover:text-primary',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId={`${uid}-pill`}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-flame shadow-[0_8px_20px_-10px_rgba(200,77,14,.9)]"
                />
              ) : null}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className={cn('pt-6 sm:pt-7', panelClassName)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            role="tabpanel"
            id={`${uid}-panel-${current.id}`}
            aria-labelledby={`${uid}-tab-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {current.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tabs;
