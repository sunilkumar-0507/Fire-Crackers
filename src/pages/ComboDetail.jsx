import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Clock, Package, ShoppingBag, Truck, Users } from 'lucide-react';
import { combos, findCombo } from '@/data';
import { formatPrice, addWorkingDays, formatDay } from '@/utils/format';
import { comboToCartItem } from '@/utils/cart';
import { useCartStore, selectInCart } from '@/store/cartStore';
import { fadeUp, inView, stagger } from '@/animations/variants';
import PageHeader from '@/components/ui/PageHeader';
import Section, { SectionHeading } from '@/components/ui/Section';
import ComboCard from '@/components/combo/ComboCard';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import QtyStepper from '@/components/ui/QtyStepper';
import EmptyState from '@/components/ui/EmptyState';

export const ComboDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const combo = findCombo(slug);

  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore(selectInCart(combo?.id ?? ''));
  const [qty, setQty] = useState(1);

  const others = useMemo(() => combos.filter((c) => c.slug !== slug).slice(0, 3), [slug]);

  if (!combo) {
    return (
      <div className="container py-24">
        <EmptyState
          illustration="crate"
          title="That combo pack is not in this season's range"
          description="We rebuild the boxes every year. Here is what we are packing now."
          action={<Button to="/combos">See this year's combos</Button>}
        />
      </div>
    );
  }

  const add = () => {
    const { added } = addItem(comboToCartItem(combo), qty);
    if (added > 0) toast.success(`${added} × ${combo.name} added`);
  };

  const buyNow = () => {
    addItem(comboToCartItem(combo), qty);
    navigate('/checkout');
  };

  const itemTotal = combo.includes.reduce((n, line) => n + line.qty, 0);

  return (
    <>
      <PageHeader
        eyebrow={combo.badge}
        title={combo.name}
        description={combo.description}
        breadcrumbs={[{ label: 'Combo packs', to: '/combos' }, { label: combo.name }]}
        accent={combo.accent}
      />

      <div className="container pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-14">
          {/* left: contents */}
          <div>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[2rem] border border-line shadow-card"
              style={{ background: `linear-gradient(140deg, ${combo.accent}26, #FFFFFF 55%, ${combo.accent}1a)` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-40 opacity-45"
                style={{ background: `radial-gradient(55% 100% at 50% 100%, ${combo.accent}, transparent 72%)` }}
              />
              <div className="relative h-3/4 w-3/4 animate-float">
                <CrackerArt type={combo.art} variant={2} className="h-full w-full" />
              </div>
              <Badge tone="gold" className="absolute left-4 top-4 sm:left-6 sm:top-6">
                {combo.badge}
              </Badge>
            </motion.div>

            <motion.div variants={stagger(0.05)} {...inView} className="mt-10">
              <motion.h2 variants={fadeUp} className="font-display text-2xl font-semibold text-dark">
                Everything inside the box
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-2 text-sm text-muted">
                {itemTotal} pieces across {combo.includes.length} product types. The same list is
                printed inside the lid.
              </motion.p>

              <motion.ul variants={stagger(0.04)} className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-line bg-line">
                {combo.includes.map((line) => (
                  <motion.li
                    key={line.name}
                    variants={fadeUp}
                    className="flex items-center gap-3 bg-card px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check size={15} strokeWidth={2.8} />
                    </span>
                    <span className="flex-1 text-sm font-medium text-dark">{line.name}</span>
                    <span className="shrink-0 rounded-full bg-secondary-50 px-3 py-1 text-2xs font-bold text-primary">
                      × {line.qty}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </div>

          {/* right: buy rail */}
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate="show"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <motion.div
              variants={fadeUp}
              className="rounded-4xl border border-line bg-card p-5 shadow-card sm:p-7"
            >
              <p className="text-sm italic text-primary">{combo.tagline}</p>

              <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-2">
                <span className="font-display text-3xl font-semibold text-dark sm:text-4xl">
                  {formatPrice(combo.price)}
                </span>
                <span className="pb-1.5 text-base text-muted line-through">
                  {formatPrice(combo.mrp)}
                </span>
              </div>
              <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                You save {formatPrice(combo.saves)} · {combo.discount}% off
              </p>

              <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line text-center">
                {[
                  { icon: Package, value: combo.itemCount, label: 'Items' },
                  { icon: Users, value: combo.serves, label: 'Serves' },
                  { icon: Clock, value: combo.duration === '—' ? 'N/A' : combo.duration.replace('About ', ''), label: 'Runs for' },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="bg-card px-2 py-4">
                    <Icon size={15} className="mx-auto text-primary" strokeWidth={2.2} />
                    <dd className="mt-2 text-xs font-semibold leading-tight text-dark">{value}</dd>
                    <dt className="mt-1 text-[9px] uppercase tracking-[.14em] text-muted">{label}</dt>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <QtyStepper size="lg" value={qty} onChange={setQty} max={Math.max(1, combo.stock)} />
                <Button
                  onClick={add}
                  size="lg"
                  className="w-full flex-1 px-4 xs:w-auto xs:min-w-[160px] sm:px-8"
                  leftIcon={<ShoppingBag size={18} />}
                >
                  Add — {formatPrice(combo.price * qty)}
                </Button>
              </div>

              <Button onClick={buyNow} variant="dark" size="lg" className="mt-3 w-full">
                Buy it now
              </Button>

              {inCart > 0 ? (
                <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-700">
                  <Check size={14} strokeWidth={2.8} />
                  {inCart} already in your basket
                </p>
              ) : null}

              <div className="mt-6 space-y-3 border-t border-line pt-5 text-[13px] text-muted">
                <p className="flex items-start gap-2.5">
                  <Truck size={15} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.2} />
                  Arrives {formatDay(addWorkingDays(2))} – {formatDay(addWorkingDays(4))}, free
                  above {formatPrice(2000)}
                </p>
                <p className="flex items-start gap-2.5">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
                  Use <strong className="font-semibold text-dark">COMBO500</strong> for a further ₹500 off
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                <Rating value={combo.rating} reviews={combo.reviews} size="sm" />
                <span className="text-2xs text-muted">{combo.stock} boxes left</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {others.length ? (
        <Section spacing="sm" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
          <div className="container">
            <SectionHeading eyebrow="Also consider" title="Other boxes in the range" className="pb-8" />
            <motion.div variants={stagger(0.07)} {...inView} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {others.map((other) => (
                <ComboCard key={other.id} combo={other} showContents={false} />
              ))}
            </motion.div>
          </div>
        </Section>
      ) : null}
    </>
  );
};

export default ComboDetail;
