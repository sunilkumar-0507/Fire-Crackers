/**
 * The browser APIs jsdom does not ship but the shop calls anyway.
 *
 * Extracted from the mount smoke test so a second suite can mount the same
 * pages without a second copy of all this drifting out of step with the first.
 * Every stub here earned its place by breaking a render: the canvas context
 * for the hero's fireworks, ResizeObserver because that canvas measures
 * itself, IntersectionObserver because the seven sections below the fold never
 * mount without it.
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
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, writable: true });

  // Enough of a 2D context for the hero's fireworks to run a frame against.
  // A partial stub is worse than none: anything using a stroke or a composite
  // mode throws on first paint, which is how this list got long.
  HTMLCanvasElement.prototype.getContext = () => ({
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    shadowBlur: 0,
    shadowColor: '',
    setTransform() {}, scale() {}, translate() {},
    clearRect() {}, fillRect() {},
    beginPath() {}, closePath() {}, arc() {}, moveTo() {}, lineTo() {},
    fill() {}, stroke() {},
    drawImage() {}, save() {}, restore() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    createLinearGradient: () => ({ addColorStop() {} }),
  });

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
