/**
 * The best-sellers carousel.
 *
 * It has to advance on its own and still be movable by hand. Those two pull
 * against each other — autoplay that cannot be escaped is the thing people
 * hate about carousels — so the settings that keep them compatible are worth
 * pinning down rather than leaving to whoever edits the file next.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Captures the props the component hands to Swiper, without rendering one.
 *
 * `renders` keeps every pass, not just the last. Swiper reads `autoplay` once,
 * when it initialises, so the only render that decides whether the carousel
 * ever moves is the first one — and a version of this component that started
 * `autoplay` at `false` and corrected it in an effect passed every assertion
 * against `current` while standing completely still in a browser.
 */
const swiperProps = { current: null };
const renders = [];

vi.mock('swiper/react', () => ({
  Swiper: (props) => {
    swiperProps.current = props;
    renders.push(props);
    return <div data-testid="swiper">{props.children}</div>;
  },
  SwiperSlide: ({ children }) => <div>{children}</div>,
}));

vi.mock('swiper/modules', () => ({
  A11y: 'A11y',
  Autoplay: 'Autoplay',
  FreeMode: 'FreeMode',
  Navigation: 'Navigation',
  Pagination: 'Pagination',
}));

vi.mock('swiper/css', () => ({}));
vi.mock('swiper/css/pagination', () => ({}));
vi.mock('swiper/css/free-mode', () => ({}));

const { default: BestSellers } = await import('@/components/home/BestSellers');

let reduceMotion = false;

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
});

const render = async () => {
  renders.length = 0;
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(
      <MemoryRouter>
        <BestSellers />
      </MemoryRouter>,
    );
  });
  return { host, root };
};

describe('best sellers carousel', () => {
  it('advances on its own', async () => {
    reduceMotion = false;
    await render();

    const { autoplay } = swiperProps.current;
    expect(autoplay).toBeTruthy();
    expect(autoplay.delay).toBeGreaterThan(0);
  });

  it('has autoplay on from the very first render', async () => {
    reduceMotion = false;
    await render();

    // Not `swiperProps.current` — the last render is not the one that matters.
    expect(renders.length).toBeGreaterThan(0);
    expect(renders[0].autoplay).toBeTruthy();
    expect(renders[0].autoplay.delay).toBeGreaterThan(0);
  });

  it('keeps autoplay off from the first render under reduced motion', async () => {
    reduceMotion = true;
    await render();

    expect(renders[0].autoplay).toBeFalsy();
  });

  it('keeps advancing after the reader has touched it', async () => {
    reduceMotion = false;
    await render();

    // The default is `true`, which kills autoplay permanently at the first
    // swipe — one nudge and the carousel is dead for the rest of the visit.
    expect(swiperProps.current.autoplay.disableOnInteraction).toBe(false);
  });

  it('pauses while the pointer is over it', async () => {
    reduceMotion = false;
    await render();

    expect(swiperProps.current.autoplay.pauseOnMouseEnter).toBe(true);
  });

  it('does not autoplay for anyone who asked for reduced motion', async () => {
    reduceMotion = true;
    await render();

    expect(swiperProps.current.autoplay).toBeFalsy();
  });

  it('is still movable by hand', async () => {
    reduceMotion = false;
    await render();

    const props = swiperProps.current;
    expect(props.grabCursor).toBe(true);
    expect(props.modules).toContain('Navigation');
    expect(props.modules).toContain('Pagination');
    expect(props.modules).toContain('Autoplay');
  });
});
