import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

/**
 * Centred dialog rendered into a portal.
 *
 * Handles the accessibility basics a modal needs: focus moves in on open and
 * returns to the trigger on close, Escape dismisses, and focus is trapped in
 * the panel while it is open.
 */
export const Modal = ({ open, onClose, children, className, label = 'Dialog' }) => {
  const panelRef = useRef(null);
  const restoreRef = useRef(null);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement;

    const raf = requestAnimationFrame(() => {
      const target =
        panelRef.current?.querySelector('[data-autofocus]') ??
        panelRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
      target?.focus();
    });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <div onClick={onClose} className="absolute inset-0 bg-dark/45 backdrop-blur-md" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          // `svh` rather than `vh`: mobile browser chrome is counted out of
          // `svh`, so the panel cannot end up taller than what is visible.
          'relative max-h-[calc(100svh-1.5rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-4xl bg-card shadow-lift sm:max-h-[90vh]',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-card text-ink shadow-soft backdrop-blur transition-all duration-300 hover:rotate-90 hover:bg-card hover:text-primary sm:right-4 sm:top-4"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
