import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from '@/routes';

/**
 * App root.
 *
 * There is deliberately nothing between the visitor and the storefront. This
 * used to open on a 4.5-second GSAP intro — a diya lighting, embers rising, a
 * rocket climbing and breaking into a firework — behind which the router was
 * mounted but inert. It looked good exactly once. On a shop whose visitors
 * arrive from a WhatsApp link with a price in mind, a gate that long is the
 * most expensive thing on the page, so the catalogue now paints immediately.
 */
export const App = ({ degraded = false, degradedReason }) => {
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {/*
        Not an offline banner any more. The catalogue is never stale — without
        it the shop does not mount at all, so if this renders, the prices below
        are live and only the surrounding settings (delivery copy, payment
        methods, districts) fell back to their defaults. Worth saying, not
        worth alarming anyone about.
      */}
      {degraded && !dismissed ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-100 px-4 py-2 text-center text-2xs font-medium text-amber-900 sm:text-xs"
        >
          <span>
            Prices are up to date, but some shop settings could not be loaded
            {degradedReason ? ` (${degradedReason})` : ''}.
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full px-2 py-0.5 underline underline-offset-2 hover:bg-amber-200"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <RouterProvider router={router} />

      <Toaster
        position="bottom-center"
        gutter={10}
        containerClassName="!bottom-28 lg:!bottom-8"
        toastOptions={{
          duration: 2600,
          className:
            '!rounded-2xl !border !border-line !bg-card !px-4 !py-3 !text-sm !font-medium !text-ink !shadow-lift',
          success: { iconTheme: { primary: '#0A7A6B', secondary: '#fff' } },
          error: { iconTheme: { primary: '#93154D', secondary: '#fff' } },
        }}
      />
    </>
  );
};

export default App;
