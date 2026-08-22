import { useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, Check, FileText, Phone, Send, Truck, UserCheck } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { BRAND, DISTRICTS } from '@/constants';
import { api } from '@/data';
import { formatPrice } from '@/utils/format';
import PageHeader from '@/components/ui/PageHeader';
import Section, { SectionHeading } from '@/components/ui/Section';
import Button from '@/components/ui/Button';

const BENEFITS = [
  { icon: UserCheck, title: 'A named coordinator', text: 'One person, one number, from quote to delivery. Not a call centre.' },
  { icon: FileText, title: 'GST invoicing', text: 'Raised against your GSTIN the same day, with a delivery challan.' },
  { icon: Truck, title: 'A delivery date you pick', text: 'Scheduled to your slot, not whenever the transporter is passing.' },
  { icon: Building2, title: '20% off above ₹25,000', text: 'On top of the catalogue discount already in the price.' },
];

const ORDER_TYPES = [
  'Apartment association',
  'Temple / community committee',
  'Company staff gifting',
  'School or college event',
  'Wedding or family function',
  'Reseller / shop stock',
];

const BUDGETS = ['₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000 – ₹3,00,000', 'Above ₹3,00,000'];

const Field = ({ label, hint, error, children }) => (
  <label className="block">
    <span className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-2xs font-semibold uppercase tracking-[.14em] text-dark">{label}</span>
      {hint ? <span className="text-2xs text-muted">{hint}</span> : null}
    </span>
    {children}
    {error ? (
      <span className="mt-1.5 block text-2xs text-rose-600" role="alert">
        {error}
      </span>
    ) : null}
  </label>
);

const inputClass =
  'h-12 w-full rounded-2xl border border-line bg-card px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-secondary-400';

export const BulkOrders = () => {
  const [form, setForm] = useState({
    organisation: '',
    contact: '',
    phone: '',
    email: '',
    district: '',
    type: ORDER_TYPES[0],
    budget: BUDGETS[0],
    people: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();

    const next = {};
    if (!form.organisation.trim()) next.organisation = 'Tell us who the order is for';
    if (!form.contact.trim()) next.contact = 'We need a name to ask for';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s|-/g, '')))
      next.phone = 'A 10-digit Indian mobile number, please';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      next.email = 'That email does not look right';
    if (!form.district) next.district = 'Which district are we delivering to?';

    if (Object.keys(next).length) {
      setErrors(next);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setState('loading');
    await api.placeOrder({ kind: 'bulk-enquiry', ...form });
    setState('done');
    toast.success('Enquiry received — we will call within a working day');
  };

  return (
    <>
      <PageHeader
        eyebrow="Bulk & institutional"
        title="Ordering for a street, a temple or an office"
        description="About a third of what leaves our floor goes out as a bulk order. Several of the associations we supply have been with us for more than a decade — this is the form that starts it."
        breadcrumbs={[{ label: 'Bulk orders' }]}
        art="bomb"
        artVariant={2}
        accent="#8C3A12"
      />

      {/* benefits */}
      <div className="container">
        <ul
          className="grid gap-px overflow-hidden rounded-4xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="group bg-card p-6 transition-colors hover:bg-card">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary-50 text-primary transition-all duration-500 ease-luxe group-hover:scale-110 group-hover:bg-flame group-hover:text-dark">
                <Icon size={19} />
              </span>
              <h3 className="mt-5 font-display text-base font-semibold text-dark">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <Section>
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
            {/* form */}
            <div>
              <SectionHeading
                eyebrow="Request a quote"
                icon={<FileText size={13} />}
                title="Tell us roughly what you need"
                description="No commitment. We will come back with a written quote, a suggested product list and a delivery date."
                className="pb-8"
              />

              {state === 'done' ? (
                <div className="rounded-4xl border border-emerald-200 bg-emerald-50/70 p-6 text-center sm:p-10">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lift">
                    <Check size={30} />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-emerald-900">
                    Enquiry received
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-800/80">
                    A coordinator will call {form.phone} within one working day. If it is urgent,
                    ring the shop directly and quote {form.organisation}.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Button href={BRAND.phoneHref} leftIcon={<Phone size={16} />}>
                      {BRAND.phone}
                    </Button>
                    <Button variant="outline" onClick={() => setState('idle')}>
                      Send another enquiry
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-5 rounded-4xl border border-line bg-card p-5 shadow-card sm:p-9">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Organisation / association" error={errors.organisation}>
                      <input
                        value={form.organisation}
                        onChange={set('organisation')}
                        placeholder="Green Meadows Owners Association"
                        className={cn(inputClass, errors.organisation && 'border-rose-300')}
                      />
                    </Field>

                    <Field label="Contact person" error={errors.contact}>
                      <input
                        value={form.contact}
                        onChange={set('contact')}
                        placeholder="Your name"
                        autoComplete="name"
                        className={cn(inputClass, errors.contact && 'border-rose-300')}
                      />
                    </Field>

                    <Field label="Phone" hint="We will call this" error={errors.phone}>
                      <input
                        value={form.phone}
                        onChange={set('phone')}
                        placeholder="98420 11994"
                        inputMode="tel"
                        autoComplete="tel"
                        className={cn(inputClass, errors.phone && 'border-rose-300')}
                      />
                    </Field>

                    <Field label="Email" hint="Optional" error={errors.email}>
                      <input
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@example.com"
                        inputMode="email"
                        autoComplete="email"
                        className={cn(inputClass, errors.email && 'border-rose-300')}
                      />
                    </Field>

                    <Field label="District" error={errors.district}>
                      <select
                        value={form.district}
                        onChange={set('district')}
                        className={cn(inputClass, 'cursor-pointer', errors.district && 'border-rose-300')}
                      >
                        <option value="">Select a district</option>
                        {DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Order type">
                      <select value={form.type} onChange={set('type')} className={cn(inputClass, 'cursor-pointer')}>
                        {ORDER_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Approximate budget">
                      <select value={form.budget} onChange={set('budget')} className={cn(inputClass, 'cursor-pointer')}>
                        {BUDGETS.map((budget) => (
                          <option key={budget} value={budget}>
                            {budget}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Households / recipients" hint="Optional">
                      <input
                        value={form.people}
                        onChange={set('people')}
                        placeholder="96 flats"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Anything else we should know" hint="Optional">
                    <textarea
                      value={form.notes}
                      onChange={set('notes')}
                      rows={4}
                      placeholder="Delivery date, whether you need the silent range, printed sleeves with the company name…"
                      className="w-full resize-none rounded-2xl border border-line bg-card p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-secondary-400"
                    />
                  </Field>

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <Button
                      type="submit"
                      size="lg"
                      loading={state === 'loading'}
                      onClick={submit}
                      rightIcon={state === 'loading' ? null : <Send size={16} />}
                    >
                      Request a quote
                    </Button>
                    <p className="text-2xs text-muted">
                      We reply within one working day, {BRAND.hours.toLowerCase()}.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* aside */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-4xl border border-line bg-card p-5 shadow-card sm:p-7">
                <h3 className="font-display text-xl font-semibold text-dark">How the pricing works</h3>
                <ul className="mt-5 space-y-3.5">
                  {[
                    ['Above ₹25,000', 'A further 20% off, GST invoice, named coordinator'],
                    ['Above ₹1,00,000', 'Add printed sleeves and a scheduled delivery slot'],
                    ['Above ₹3,00,000', 'Direct despatch from the Sivakasi unit, 30% advance'],
                  ].map(([tier, detail]) => (
                    <li key={tier} className="rounded-2xl bg-secondary-50/60 p-4">
                      <p className="text-sm font-semibold text-dark">{tier}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{detail}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 border-t border-line pt-6">
                  <p className="text-[13px] leading-relaxed text-muted">
                    Our most-ordered bulk item is the Office Gifting Carton — 25 boxes for{' '}
                    {formatPrice(12999)}, invoice included.
                  </p>
                  <Button to="/combo/office-gifting-carton" variant="outline" size="sm" className="mt-4">
                    See the carton
                  </Button>
                </div>
              </div>

              <div className="mt-5 rounded-4xl border border-line bg-dark p-5 text-bg sm:p-7">
                <h3 className="font-display text-lg font-semibold text-bg">Rather just talk?</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-bg/75">
                  Call the shop and describe the event. We have quoted a few thousand of these.
                </p>
                <Button href={BRAND.phoneHref} variant="gold" size="sm" className="mt-5" leftIcon={<Phone size={15} />}>
                  {BRAND.phone}
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </>
  );
};

export default BulkOrders;
