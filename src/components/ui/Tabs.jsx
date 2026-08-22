import { useId, useState } from 'react';
import { cn } from '@/utils/cn';

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
        className="hide-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-card p-1.5"
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
                isActive ? 'text-dark' : 'text-muted hover:text-primary',
              )}
            >
              {isActive ? (
                <span className="absolute inset-0 rounded-full bg-flame shadow-soft" />
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
        <div
          key={current.id}
          role="tabpanel"
          id={`${uid}-panel-${current.id}`}
          aria-labelledby={`${uid}-tab-${current.id}`}
        >
          {current.content}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
