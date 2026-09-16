import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
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
 * A failed fetch is not fatal: `bootstrap()` leaves the bundled JSON in place
 * and reports it, so the shop still renders with the catalogue it shipped with.
 * The banner in App tells the shopkeeper the API is down.
 */
const status = await bootstrap();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App offline={!status.live} offlineReason={status.reason} />
  </StrictMode>,
);
