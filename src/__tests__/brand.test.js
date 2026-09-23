import { describe, it, expect } from 'vitest';
import { BRAND, hydrateConfig } from '@/constants';

/**
 * The brand block is layered: what the API sends wins, what it does not send
 * falls back to the values compiled in. The second shop number is the case
 * that forced it — it lives only in the front end until the API's brand
 * payload grows a `phoneAlt`, and the previous wholesale replace dropped it
 * on every boot.
 */
describe('brand hydration', () => {
  it('keeps details the API does not know about', () => {
    hydrateConfig({
      brand: {
        name: 'SKV Pyros',
        phone: '+91 94874 79000',
        email: 'skvpyros@gmail.com',
      },
    });

    expect(BRAND.phoneAlt).toBe('+91 89393 89000');
    expect(BRAND.phoneAltHref).toBe('tel:+918939389000');
  });

  it('lets the API overwrite what it does send', () => {
    hydrateConfig({ brand: { name: 'Renamed', phone: '+91 90000 00000' } });

    expect(BRAND.name).toBe('Renamed');
    expect(BRAND.phoneHref).toBe('tel:+919000000000');
  });

  it('treats an explicit null as cleared rather than absent', () => {
    hydrateConfig({ brand: { name: 'SKV Pyros', email: null } });

    expect(BRAND.email).toBeNull();
    // No half-built `mailto:` — consumers check this before rendering a row.
    expect(BRAND.emailHref).toBeNull();
  });

  it('derives a dialable href for both numbers', () => {
    hydrateConfig({
      brand: { phone: '+91 94874 79000', phoneAlt: '+91 89393 89000' },
    });

    expect(BRAND.phoneHref).toBe('tel:+919487479000');
    expect(BRAND.phoneAltHref).toBe('tel:+918939389000');
  });
});
