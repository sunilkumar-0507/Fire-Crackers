import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck } from '@/components/ui/icons';
import { BRAND, FOOTER_LINKS, SOCIALS } from '@/constants';
import { LogoMark } from '@/components/ui/Logo';

/**
 * Row of small lit diyas along the top edge of the footer.
 *
 * They used to flicker on a staggered loop — fourteen animations running
 * forever at the bottom of every page. They are simply lit now.
 */
const DiyaBorder = memo(function DiyaBorder() {
  return (
    <div className="relative h-12 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary-400/50 to-transparent" />
      <div className="flex h-full items-center justify-center gap-6 sm:gap-12">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="relative shrink-0 opacity-80">
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
              <path d="M11 1 C13.4 4.6 14.8 7.2 14.8 9.2 C14.8 11.6 13 13.4 11 13.4 C9 13.4 7.2 11.6 7.2 9.2 C7.2 7.2 8.6 4.6 11 1 Z" fill="#FFD56A" />
              <path d="M1 15 C1 15 4.6 14 11 14 C17.4 14 21 15 21 15 C20 19.6 16 23 11 23 C6 23 2 19.6 1 15 Z" fill="#C84D0E" />
              <ellipse cx="11" cy="15" rx="9" ry="1.5" fill="#FF8A00" />
            </svg>
            <span
              className="absolute -inset-2 -z-10"
              style={{ background: 'radial-gradient(closest-side, rgba(255,180,70,.5), transparent 70%)' }}
            />
          </span>
        ))}
      </div>
    </div>
  );
});

export const Footer = () => (
  <footer className="relative mt-16 overflow-hidden bg-dark text-bg/85">
    {/* warm gradient wash */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-90"
      style={{
        background:
          'radial-gradient(90% 60% at 50% 0%, rgba(149,76,5,.45) 0%, transparent 60%), linear-gradient(180deg,#2B1408,#1A0C04)',
      }}
    />

    <div className="relative">
      <DiyaBorder />

      {/* The floating basket pill sits over the bottom ~76px on small screens,
          so the last row needs clearance to stay reachable. */}
      <div className="container pb-28 pt-8 lg:pb-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-12">
          {/* brand column */}
          <div className="max-w-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <LogoMark size={44} />
              <div className="leading-none">
                <p className="font-display text-2xl font-semibold text-bg">{BRAND.name}</p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[.22em] text-gold/70">
                  {BRAND.tagline}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-bg/75">
              Three generations on the same factory floor in Sivakasi, making the crackers we grew
              up lighting. Sold direct, at the price they should have always been.
            </p>

            <div className="mt-7 space-y-3 text-sm">
              <a href={BRAND.phoneHref} className="flex items-center gap-3 text-bg/85 transition-colors hover:text-gold">
                <Phone size={15} className="shrink-0 text-gold/70" />
                {BRAND.phone}
              </a>
              <a href={BRAND.emailHref} className="flex items-center gap-3 text-bg/85 transition-colors hover:text-gold">
                <Mail size={15} className="shrink-0 text-gold/70" />
                <span className="min-w-0 break-all">{BRAND.email}</span>
              </a>
              <p className="flex items-start gap-3 text-bg/75">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gold/70" />
                {BRAND.address}
              </p>
            </div>
          </div>

          {/* link columns */}
          {FOOTER_LINKS.map((column) => (
            <div key={column.title}>
              <h3 className="text-2xs font-semibold uppercase tracking-[.2em] text-gold">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-2 text-sm text-bg/75 transition-colors duration-300 hover:text-bg"
                    >
                      <span className="h-px w-0 bg-gold transition-all duration-400 ease-luxe group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* licence strip */}
        <div
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-3xl border border-white/[.07] bg-white/[.03] px-5 py-5 text-2xs text-bg/75 sm:mt-12 sm:px-6"
        >
          <span className="flex items-center gap-2 text-gold/80">
            <ShieldCheck size={14} />
            {BRAND.licence}
          </span>
          <span>GSTIN {BRAND.gstin}</span>
          <span>{BRAND.hours}</span>
        </div>

        {/* bottom row */}
        <div
          className="mt-8 flex flex-col-reverse items-center justify-between gap-6 border-t border-white/[.07] pt-8 sm:flex-row"
        >
          <p className="text-2xs text-bg/75">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Burst responsibly.
          </p>

          <div className="flex items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 text-2xs font-medium text-bg/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:text-gold"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
