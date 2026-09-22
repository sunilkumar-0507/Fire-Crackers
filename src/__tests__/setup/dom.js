/**
 * The browser APIs jsdom does not ship but the shop calls anyway.
 *
 * Extracted from the mount smoke test so a second suite can mount the same
 * pages without a second copy of all this drifting out of step with the first.
 * Every stub here earned its place by breaking a render: IntersectionObserver
 * because the seven sections below the fold never mount without it, and
 * ResizeObserver because the carousels measure themselves on mount.
 *
 * The 2D canvas context that used to head this list went out with the hero's
 * fireworks — the shop no longer draws to a canvas anywhere.
 *
 * Idempotent, so calling it from several `beforeAll` hooks is safe.
 */
export const installDomStubs = () => {
  // Tells React that `act()` is legitimate here rather than a stray call.
  global.IS_REACT_ACT_ENVIRONMENT = true;

  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });

  window.scrollTo = () => {};

  window.requestAnimationFrame =
    window.requestAnimationFrame ?? ((cb) => setTimeout(() => cb(0), 0));
  window.cancelAnimationFrame = window.cancelAnimationFrame ?? ((id) => clearTimeout(id));

  /**
   * Reports every observed element as visible, immediately.
   *
   * A no-op stub meant `DeferredSection` never mounted its children, so the
   * sections below the fold on the homepage — best sellers, offers, combos,
   * the FAQ, the newsletter — were not covered by a single test. A smoke test
   * exists to catch a page that blanks at runtime, and those were exactly the
   * components it could not see.
   */
  global.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }

    observe(target) {
      this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }], this);
    }

    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };

  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

export default installDomStubs;
