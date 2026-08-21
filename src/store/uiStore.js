import { create } from 'zustand';

/**
 * Transient UI state: overlays and the quick-view target.
 * Deliberately not persisted — a refresh should land on a clean page.
 */
export const useUIStore = create((set, get) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  quickView: null,

  openCart: () => set({ cartOpen: true, searchOpen: false, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set({ cartOpen: !get().cartOpen, searchOpen: false, menuOpen: false }),

  openSearch: () => set({ searchOpen: true, cartOpen: false, menuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  toggleSearch: () => set({ searchOpen: !get().searchOpen, cartOpen: false, menuOpen: false }),

  openMenu: () => set({ menuOpen: true, cartOpen: false, searchOpen: false }),
  closeMenu: () => set({ menuOpen: false }),
  toggleMenu: () => set({ menuOpen: !get().menuOpen, cartOpen: false, searchOpen: false }),

  setQuickView: (product) => set({ quickView: product }),
  closeQuickView: () => set({ quickView: null }),

  closeAll: () => set({ cartOpen: false, searchOpen: false, menuOpen: false, quickView: null }),
}));

/** True when any overlay owns the screen — used to lock body scroll once. */
export const selectAnyOverlay = (s) => s.cartOpen || s.searchOpen || s.menuOpen || !!s.quickView;
