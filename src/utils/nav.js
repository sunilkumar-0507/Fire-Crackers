import { NAV_LINKS } from '@/constants';
import { categoriesWithCounts } from '@/data';

/**
 * The primary navigation, with the Categories dropdown filled from the live
 * catalogue.
 *
 * That dropdown used to be twelve hardcoded entries in `constants`, each with
 * its own hand-written hint. Every one of them was a promise the shop could not
 * keep: rename a category in the admin and the nav kept the old name, delete
 * one and the nav still linked to it, add one and it never appeared. The menu
 * was quietly describing a different shop from the one behind it.
 *
 * Now the labels, the links and the hints all come from the same rows the
 * category pages are built from, so they cannot disagree. The hint is the
 * category's own tagline — which is also better copy than the hardcoded hints
 * were, because the shopkeeper writes it.
 *
 * Lives here rather than in `constants` because `constants` cannot import
 * `data` — `data` already imports `constants`, and that would be a cycle.
 *
 * A plain function, not a hook: the catalogue arrives before React mounts and
 * the router remounts on `catalogVersion`, so calling this during render always
 * reads the current list.
 */
export const buildNavLinks = () =>
  NAV_LINKS.map((link) => {
    if (link.dynamic !== 'categories') return link;

    // No categories means no menu to open. The entry stays as a plain link to
    // the full catalogue rather than becoming a button that opens an empty
    // panel, which is the shape every dropdown component here already handles.
    if (!categoriesWithCounts.length) {
      const { dynamic: _dynamic, ...plain } = link;
      return plain;
    }

    return {
      ...link,
      children: categoriesWithCounts.map((category) => ({
        label: category.name,
        to: `/category/${category.slug}`,
        hint: category.tagline,
      })),
    };
  });

export default buildNavLinks;

/**
 * Bottom offset for the floating WhatsApp and back-to-top buttons.
 *
 * Normally they sit just above the phone tab bar. The quick-order page pins a
 * running total above that bar too, so there they climb over it as well —
 * otherwise both buttons land on top of the total and its View cart button.
 */
export const floatingOffset = (pathname) =>
  pathname === '/quick-order'
    ? 'bottom-[calc(12rem+env(safe-area-inset-bottom))] lg:bottom-36'
    : 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-8';
