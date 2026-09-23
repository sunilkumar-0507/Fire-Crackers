import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { whatsappHref, generalEnquiryMessage } from '@/utils/whatsapp';

/**
 * The persistent WhatsApp enquiry button — requirement 7.
 *
 * Bottom left, because bottom right is already taken by scroll-to-top and, on
 * a phone, the floating basket bar sits across the bottom edge. `bottom-24`
 * clears that bar; `lg:bottom-8` drops back down once it is gone.
 *
 * Hidden on checkout. Someone three steps into placing an order does not need
 * a button inviting them to start again in a different app, and a mis-tap
 * there costs a sale.
 *
 * The icon is inline rather than from `react-icons` so this weighs nothing and
 * renders before any icon chunk has loaded — it is on every page.
 */
const WhatsAppGlyph = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35Z" />
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.24 8.23Z" />
  </svg>
);

export const WhatsAppButton = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/checkout')) return null;

  return (
    <a
      href={whatsappHref(generalEnquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.whatsappClick(pathname)}
      aria-label="Message SKV Pyros on WhatsApp"
      className="group fixed bottom-24 left-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition-all duration-300 hover:-translate-y-1 hover:bg-[#1FB855] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] lg:bottom-8 lg:left-8 lg:h-14 lg:w-14"
    >
      <WhatsAppGlyph />

      {/* The label only exists on a pointer device: on a phone there is no
          hover, and a permanently visible pill would eat the corner. */}
      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-full bg-dark px-3 py-1.5 text-2xs font-semibold text-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block">
        Message us
      </span>
    </a>
  );
};

export default WhatsAppButton;
