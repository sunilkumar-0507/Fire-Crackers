/**
 * Shared Framer Motion variants.
 *
 * Every transform here is limited to `opacity`, `x`, `y`, `scale` and `rotate`
 * so the compositor can run them off the main thread. Nothing animates
 * width/height/top/left, which is what keeps long pages at 60fps.
 */

export const EASE = [0.22, 1, 0.36, 1];
export const EASE_IN = [0.62, 0.05, 0.36, 1];

/** Standard "reveal as it enters the viewport" props for a section wrapper. */
export const inView = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const fadeDown = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: EASE } },
};

export const slideLeft = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const slideRight = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Parent that staggers its children. Pair with any child variant above. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

export const staggerContainer = stagger();

/** Word-by-word heading reveal — the hero title uses this. */
export const wordContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

export const wordChild = {
  hidden: { opacity: 0, y: '0.6em', rotate: 2, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: '0em',
    rotate: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE },
  },
};

/* -------------------------------------------------------------------------- */
/* Overlays                                                                    */
/* -------------------------------------------------------------------------- */

export const backdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.32, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.24, ease: EASE_IN } },
};

export const drawerRight = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 320, damping: 36, mass: 0.9 } },
  exit: { x: '100%', transition: { duration: 0.3, ease: EASE_IN } },
};

export const drawerTop = {
  hidden: { y: '-100%', opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: EASE } },
  exit: { y: '-100%', opacity: 0, transition: { duration: 0.32, ease: EASE_IN } },
};

export const dropdown = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.26, ease: EASE } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.16, ease: EASE_IN } },
};

export const modal = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.22, ease: EASE_IN } },
};

/** Route transitions — short, because a page change should feel instant. */
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.22, ease: EASE_IN } },
};

/** Accordion body — animating height is unavoidable here, so keep it short. */
export const accordion = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.28, ease: EASE_IN } },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.38, ease: EASE } },
};

export const listItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, x: 24, height: 0, marginBottom: 0, transition: { duration: 0.26 } },
};

/* -------------------------------------------------------------------------- */
/* Interaction presets                                                         */
/* -------------------------------------------------------------------------- */

export const tapScale = { scale: 0.97 };
export const hoverLift = { y: -6, transition: { duration: 0.35, ease: EASE } };
