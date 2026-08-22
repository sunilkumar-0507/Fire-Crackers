import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Mail, Send } from '@/components/ui/icons';
import { api } from '@/data';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('That does not look like an email address');
      return;
    }
    setError('');
    setState('loading');
    await api.subscribe(email.trim());
    setState('done');
    toast.success('You are on the list — we will write before the rush');
  };

  return (
    <section className="relative py-10 sm:py-16">
      <div className="container">
        <div
          className="relative overflow-hidden rounded-4xl px-5 py-12 text-center shadow-lift sm:px-12 sm:py-16"
          style={{ background: 'linear-gradient(140deg,#2B1408 0%,#4A270A 52%,#6F3A09 100%)' }}
        >
          {/* decorative art */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.18]">
            <CrackerArt type="sparkler" variant={4} className="absolute -left-8 top-2 h-32 w-32 sm:h-48 sm:w-48" />
            <CrackerArt type="rocket" variant={3} className="absolute -bottom-6 -right-6 h-36 w-36 sm:h-52 sm:w-52" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40"
            style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(255,178,56,.45), transparent 70%)' }}
          />

          <div className="relative mx-auto max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-white/[.06] px-4 py-2 text-2xs font-semibold uppercase tracking-[.2em] text-gold">
              <Mail size={13} />
              Before the rush
            </span>

            <h2 className="mt-6 font-display text-display-sm font-semibold text-bg">
              We open bookings six weeks before Diwali
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-bg/75">
              One email when the season opens, one when stock on the popular boxes gets thin. That
              is the entire list. No festival greetings, no daily offers.
            </p>

            {state === 'done' ? (
              <div
                className="mt-9 inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-4 text-sm font-semibold text-emerald-300"
              >
                <Check size={17} />
                Added — we will write to {email}
              </div>
            ) : (
              <form onSubmit={submit} className="mx-auto mt-9 max-w-md">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    aria-invalid={Boolean(error)}
                    className="h-14 min-w-0 flex-1 rounded-full border border-white/12 bg-white/[.07] px-6 text-[15px] text-bg outline-none backdrop-blur transition-colors placeholder:text-bg/60 focus:border-gold/50"
                  />
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    loading={state === 'loading'}
                    onClick={submit}
                    className="shrink-0"
                    rightIcon={state === 'loading' ? null : <Send size={16} />}
                  >
                    Notify me
                  </Button>
                </div>
                {error ? (
                  <p className="mt-3 text-2xs text-rose-300" role="alert">
                    {error}
                  </p>
                ) : (
                  <p className="mt-3 text-2xs text-bg/75">
                    Two emails a year. Unsubscribe from any of them.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
