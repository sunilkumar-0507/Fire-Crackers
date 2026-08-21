import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { accordion, EASE } from '@/animations/variants';

export const AccordionItem = ({ question, answer, badge, isOpen, onToggle }) => {
  const id = useId().replace(/:/g, '');

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-3xl border transition-all duration-500 ease-luxe',
        isOpen
          ? 'border-secondary-200 bg-card shadow-card'
          : 'border-line bg-card hover:border-secondary-200 hover:bg-card',
      )}
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          className="flex w-full items-center gap-3 px-5 py-4 text-left sm:gap-4 sm:px-7 sm:py-6"
        >
          <span className="min-w-0 flex-1">
            {badge ? (
              <span className="mb-1.5 block text-2xs font-semibold uppercase tracking-[.16em] text-primary">
                {badge}
              </span>
            ) : null}
            <span
              className={cn(
                'block font-display text-base font-semibold transition-colors duration-300 sm:text-lg',
                isOpen ? 'text-primary' : 'text-dark group-hover:text-primary',
              )}
            >
              {question}
            </span>
          </span>

          <motion.span
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300',
              isOpen ? 'bg-flame text-dark' : 'bg-secondary-50 text-primary',
            )}
          >
            <Plus size={17} strokeWidth={2.4} />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={`panel-${id}`}
            key="panel"
            variants={accordion}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              <div className="mb-4 h-px w-full bg-gradient-to-r from-secondary-200 via-line to-transparent" />
              <p className="text-[15px] leading-[1.75] text-muted">{answer}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

/**
 * Accordion list. `allowMultiple` keeps several panels open at once; the
 * default single-open behaviour is what the FAQ uses.
 */
export const Accordion = ({ items, allowMultiple = false, defaultOpen = null, className }) => {
  const [open, setOpen] = useState(() =>
    defaultOpen != null ? [defaultOpen] : [],
  );

  const toggle = (id) =>
    setOpen((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return allowMultiple ? [...prev, id] : [id];
    });

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          question={item.question}
          answer={item.answer}
          badge={item.category}
          isOpen={open.includes(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
};

export default Accordion;
