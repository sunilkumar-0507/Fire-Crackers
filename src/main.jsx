import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import ShopUnavailable from '@/components/ShopUnavailable';
import { bootstrap } from '@/data';
import '@/styles/globals.css';

/**
 * The catalogue is fetched before React mounts.
 *
 * Every page reads `products`, `categories` and friends synchronously at render
 * time. Pulling the catalogue first keeps that true — the first paint already
 * has real data, and no page needs a loading state for something it has always
 * been able to read straight away.
 *
 * A failure here is now fatal, which it did not used to be. The shop shipped
 * with a bundled copy of the catalogue and fell back to it, so an API outage
 * rendered a complete, convincing, potentially months-old shop with no sign
 * anything was wrong. Nothing is bundled any more: the database is the only
 * source of prices, and if it cannot be read the shop says so instead of
 * guessing. A degraded boot — the catalogue arrived but, say, the fulfilment
 * copy did not — still mounts, because the missing parts have real defaults.
 */
const status = await bootstrap();

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    {status.fatal ? (
      <ShopUnavailable reason={status.reason} />
    ) : (
      <App degraded={!!status.reason} degradedReason={status.reason} />
    )}
  </StrictMode>,
);
