import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Phone } from '@/components/ui/icons';
import { BRAND } from '@/constants';
import { POLICIES, findPolicy } from '@/constants/policies';
import { analytics } from '@/lib/analytics';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Policy and information pages — requirement 14.
 *
 * One route renders all five, driven by `constants/policies.js`. Long-form
 * legal copy is set at a narrower measure than the rest of the shop (about 68
 * characters) because that is where prose stops being work to read, and a
 * policy nobody finishes is a policy nobody has been given.
 */

const Section = ({ section }) => (
  <section className="border-t border-line pt-8 first:border-0 first:pt-0">
    <h2 className="font-display text-xl font-semibold text-dark sm:text-2xl">{section.heading}</h2>

    {section.body?.map((paragraph) => (
      <p key={paragraph} className="mt-4 text-[15px] leading-[1.8] text-muted">
        {paragraph}
      </p>
    ))}

    {section.list ? (
      <ul className="mt-5 grid gap-3">
        {section.list.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[15px] leading-[1.7] text-muted">
            <Check size={16} className="mt-1 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ) : null}
  </section>
);

export const Policy = () => {
  const { slug } = useParams();
  const policy = findPolicy(slug);

  useEffect(() => {
    if (policy) analytics.pageView(`/policies/${policy.slug}`);
  }, [policy]);

  if (!policy) {
    return (
      <div className="container py-24">
        <EmptyState
          as="h1"
          illustration="search"
          title="No such policy page"
          description="That link does not match any of our information pages. The five we have are listed below."
          action={<Button to="/policies/delivery">Delivery & collection</Button>}
          secondaryAction={
            <Button to="/contact" variant="outline">
              Ask us instead
            </Button>
          }
        />
      </div>
    );
  }

  const others = POLICIES.filter((p) => p.slug !== policy.slug);

  return (
    <>
      <PageHeader
        eyebrow={policy.eyebrow}
        title={policy.title}
        description={policy.summary}
        breadcrumbs={[{ label: 'Information' }, { label: policy.title }]}
      />

      <div className="container pb-16 sm:pb-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          {/* The measure is capped in ch rather than px: it should track the
              font, not a guess about the viewport. */}
          <article className="grid max-w-[68ch] gap-8">
            <p className="text-2xs uppercase tracking-[.14em] text-muted">
              Last updated {policy.updated}
            </p>

            {policy.sections.map((section) => (
              <Section key={section.heading} section={section} />
            ))}

            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-4xl border border-line bg-card p-6 shadow-soft">
              <p className="flex-1 text-sm leading-relaxed text-muted">
                Anything here you would rather ask a person about? We would honestly rather you
                did.
              </p>
              <Button href={BRAND.phoneHref} variant="outline" leftIcon={<Phone size={15} />}>
                {BRAND.phone}
              </Button>
            </div>
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav
              aria-label="Other information pages"
              className="rounded-4xl border border-line bg-card p-5 shadow-card"
            >
              <p className="text-2xs font-semibold uppercase tracking-[.18em] text-dark">
                Also worth reading
              </p>

              <ul className="mt-4 grid gap-1">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      to={`/policies/${other.slug}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors hover:bg-secondary-50/60 hover:text-primary"
                    >
                      {other.title}
                      <ArrowRight size={14} className="shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Policy;
