import { memo } from 'react';
import { Sparkles, Truck, ShieldCheck } from 'lucide-react';

const MESSAGES = [
  { icon: Sparkles, text: 'Flat 75% off the entire catalogue — factory price, direct from Sivakasi' },
  { icon: Truck, text: 'Free delivery on orders above ₹2,000 across Tamil Nadu & Kerala' },
  { icon: ShieldCheck, text: 'Every batch PESO-tested under the 125 dB legal limit' },
  { icon: Sparkles, text: 'Order before the last week of October for an extra 10% off' },
];

/**
 * Top marquee. The track is duplicated and translated by exactly -50%, which
 * is what makes the loop seamless; `aria-hidden` on the clone keeps screen
 * readers from hearing everything twice.
 */
export const AnnouncementBar = memo(function AnnouncementBar() {
  const Track = ({ clone = false }) => (
    <div
      className="flex shrink-0 items-center gap-14 pr-14"
      aria-hidden={clone ? 'true' : undefined}
    >
      {MESSAGES.map(({ icon: Icon, text }, i) => (
        <span key={i} className="flex shrink-0 items-center gap-2.5 text-2xs font-medium tracking-wide">
          <Icon size={13} className="shrink-0 text-gold" strokeWidth={2.2} />
          {text}
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-dark text-bg/90">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: 'linear-gradient(90deg,#2C0F05,#571F05 45%,#2C0F05)' }}
      />
      <div className="relative flex h-9 items-center mask-fade-x">
        <div className="flex animate-marquee pause-on-hover">
          <Track />
          <Track clone />
        </div>
      </div>
    </div>
  );
});

export default AnnouncementBar;
