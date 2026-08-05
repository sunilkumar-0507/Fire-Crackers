import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Clock, Mail, MapPin, MessageCircle, Phone, Send, Truck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { BRAND, SOCIALS } from '@/constants';
import { api } from '@/data';
import { fadeUp, inView, stagger } from '@/animations/variants';
import PageHeader from '@/components/ui/PageHeader';
import Section, { SectionHeading } from '@/components/ui/Section';
import Button from '@/components/ui/Button';

const CHANNELS = [
  {
    icon: Phone,
    title: 'Call the shop',
    value: BRAND.phone,
    href: BRAND.phoneHref,
    hint: 'Fastest during the season. Someone who knows the stock will pick up.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: BRAND.whatsapp,
    href: 'https://wa.me/919842011994',
    hint: 'Send a photo of a list and we will price it back to you.',
  },
  {
    icon: Mail,
    title: 'Email',
    value: BRAND.email,
    href: BRAND.emailHref,
    hint: 'Best for bulk quotes, invoices and anything that needs a paper trail.',
  },
];

const SUBJECTS = [
  'A question about a product',
  'Delivery or an existing order',
  'Bulk / institutional enquiry',
  'Something arrived damaged',
  'Something else',
];

const inputClass =
  'h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-secondary-400';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: SUBJECTS[0], message: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const next = {};
    if (!form.name.trim()) next.name = 'What should we call you?';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s|-/g, ''))) next.phone = 'A 10-digit mobile number, please';
    if (!form.message.trim() || form.message.trim().length < 10)
      next.message = 'A sentence or two, so we can actually help';

    if (Object.keys(next).length) {
      setErrors(next);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setState('loading');
    await api.subscribe(form.email || form.phone);
    setState('done');
    toast.success('Message sent — we usually reply the same day');
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to someone who knows the stock"
        description="During October the phone is the fastest route — the person answering it has usually packed the box you are asking about."
        breadcrumbs={[{ label: 'Contact' }]}
        art="kids"
        artVariant={1}
        accent="#D9539B"
      />

      {/* channels */}
      <div className="container">
        <motion.div variants={stagger(0.07)} {...inView} className="grid gap-5 md:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, value, href, hint }) => (
            <motion.a
              key={title}
              variants={fadeUp}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="group rounded-4xl border border-line bg-white/85 p-5 shadow-card transition-all duration-500 ease-luxe hover:-translate-y-1.5 hover:shadow-lift sm:p-7"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary-50 text-primary transition-all duration-500 ease-luxe group-hover:scale-110 group-hover:bg-flame group-hover:text-white">
                <Icon size={20} strokeWidth={2.1} />
              </span>
              <h2 className="mt-5 text-2xs font-semibold uppercase tracking-[.16em] text-muted">
                {title}
              </h2>
              <p className="mt-2 break-words font-display text-lg font-semibold text-dark transition-colors group-hover:text-primary sm:text-xl">
                {value}
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{hint}</p>
            </motion.a>
          ))}
        </motion.div>
      </div>

      <Section>
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-16">
            {/* form */}
            <motion.div variants={fadeUp} {...inView}>
              <SectionHeading
                eyebrow="Write to us"
                title="Send a message"
                description="We read everything and reply from a real inbox, usually the same day during business hours."
                className="pb-8"
              />

              {state === 'done' ? (
                <div className="rounded-4xl border border-emerald-200 bg-emerald-50/70 p-6 text-center sm:p-10">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lift">
                    <Check size={30} strokeWidth={3} />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-emerald-900">
                    Message sent
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-800/80">
                    Thanks {form.name.split(' ')[0]} — we will reply on {form.phone}
                    {form.email ? ` or ${form.email}` : ''} shortly.
                  </p>
                  <Button variant="outline" className="mt-7" onClick={() => setState('idle')}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-5 rounded-4xl border border-line bg-white/85 p-5 shadow-card sm:p-9">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-2xs font-semibold uppercase tracking-[.14em] text-dark">
                        Your name
                      </span>
                      <input
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Meenakshi Raghavan"
                        autoComplete="name"
                        className={cn(inputClass, errors.name && 'border-rose-300')}
                      />
                      {errors.name ? <span className="mt-1.5 block text-2xs text-rose-600">{errors.name}</span> : null}
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-2xs font-semibold uppercase tracking-[.14em] text-dark">
                        Phone
                      </span>
                      <input
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="98420 11994"
                        inputMode="tel"
                        autoComplete="tel"
                        className={cn(inputClass, errors.phone && 'border-rose-300')}
                      />
                      {errors.phone ? <span className="mt-1.5 block text-2xs text-rose-600">{errors.phone}</span> : null}
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-2xs font-semibold uppercase tracking-[.14em] text-dark">
                        Email <span className="normal-case tracking-normal text-muted">(optional)</span>
                      </span>
                      <input
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@example.com"
                        inputMode="email"
                        autoComplete="email"
                        className={inputClass}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-2xs font-semibold uppercase tracking-[.14em] text-dark">
                        Subject
                      </span>
                      <select value={form.subject} onChange={set('subject')} className={cn(inputClass, 'cursor-pointer')}>
                        {SUBJECTS.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-2xs font-semibold uppercase tracking-[.14em] text-dark">
                      Message
                    </span>
                    <textarea
                      value={form.message}
                      onChange={set('message')}
                      rows={5}
                      placeholder="Tell us what you need — how many people, how much open space, and how tolerant the neighbours are."
                      className={cn(
                        'w-full resize-none rounded-2xl border border-line bg-white p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-secondary-400',
                        errors.message && 'border-rose-300',
                      )}
                    />
                    {errors.message ? <span className="mt-1.5 block text-2xs text-rose-600">{errors.message}</span> : null}
                  </label>

                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      type="submit"
                      size="lg"
                      loading={state === 'loading'}
                      onClick={submit}
                      rightIcon={state === 'loading' ? null : <Send size={16} />}
                    >
                      Send message
                    </Button>
                    <p className="text-2xs text-muted">{BRAND.hours}</p>
                  </div>
                </form>
              )}
            </motion.div>

            {/* aside */}
            <motion.aside variants={stagger(0.06)} {...inView} className="space-y-5">
              <motion.div variants={fadeUp} className="rounded-4xl border border-line bg-white/85 p-5 shadow-card sm:p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary-50 text-primary">
                  <MapPin size={19} strokeWidth={2.1} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-dark">The unit</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{BRAND.address}</p>
                <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
                  <Clock size={14} className="shrink-0 text-primary/70" strokeWidth={2.2} />
                  {BRAND.hours}
                </p>
                <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-800">
                  Visitors are welcome, but the production sheds are a licensed explosives area —
                  please call before you come so someone can walk you through.
                </p>
              </motion.div>

              <motion.div
                id="delivery"
                variants={fadeUp}
                className="rounded-4xl border border-line bg-white/85 p-5 shadow-card sm:p-7"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary-50 text-primary">
                  <Truck size={19} strokeWidth={2.1} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-dark">Delivery & returns</h3>
                <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-muted">
                  {[
                    'Tamil Nadu & Kerala in 48–72 hours; other states 3–8 days',
                    'Free above ₹2,000 locally, ₹149 below; ₹249 elsewhere',
                    'Amend or cancel free until the consignment leaves the warehouse',
                    'Damaged goods replaced or refunded — photograph the carton first',
                    'We never ask you to send fireworks back; it is neither legal nor safe',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-4xl border border-line bg-dark p-5 text-bg sm:p-7">
                <h3 className="font-display text-lg font-semibold">Find us elsewhere</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-bg/60">
                  Mostly photographs of things going off, which is the point.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/12 px-4 py-2 text-2xs font-semibold text-bg/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:text-gold"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.aside>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Contact;
