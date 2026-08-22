import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from '@/components/ui/icons';
import { categoriesWithCounts } from '@/data';
import { artForCategory } from '@/utils/image';
import { useUIStore } from '@/store/uiStore';
import CrackerArt from '@/components/ui/CrackerArt';
import Button from '@/components/ui/Button';

export const NotFound = () => {
  const navigate = useNavigate();
  const openSearch = useUIStore((s) => s.openSearch);

  return (
    <div className="relative flex min-h-[calc(100svh-var(--header-h))] items-center overflow-hidden py-12 sm:py-16">
      {/* the rocket that went off course */}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-28 w-28">
        <CrackerArt type="rocket" variant={1} className="h-full w-full" />
        <span
          className="absolute right-full top-1/2 h-1 w-40 -translate-y-1/2 rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,138,0,.55), rgba(255,213,106,.9))' }}
        />
      </div>

      <div className="container relative">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="relative grid h-40 w-40 place-items-center sm:h-52 sm:w-52">
            <span
              aria-hidden="true"
              className="absolute -inset-8 opacity-70"
              style={{ background: 'radial-gradient(closest-side, rgba(255,180,70,.6), transparent 72%)' }}
            />
            <div className="relative h-full w-full">
              <CrackerArt type="bomb" variant={2} className="h-full w-full" />
            </div>
          </div>

          <p className="mt-4 text-2xs font-semibold uppercase tracking-[.24em] text-primary">
            Error 404
          </p>

          <h1 className="mt-4 font-display text-display-md font-semibold text-dark">
            This one didn’t light
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
            The page you were after isn’t here. Wait ten minutes before approaching it again — or,
            more practically, start from one of these.
          </p>

          <div
            className="mt-8 flex w-full flex-col items-stretch gap-3 xs:w-auto xs:flex-row xs:flex-wrap xs:items-center xs:justify-center sm:mt-9"
          >
            <Button to="/" size="lg" leftIcon={<Home size={17} />}>
              Back to home
            </Button>
            <Button size="lg" variant="outline" onClick={openSearch} leftIcon={<Search size={16} />}>
              Search the catalogue
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
              Go back
            </Button>
          </div>

          {/* category shortcuts */}
          <div className="mt-12 w-full sm:mt-14">
            <p className="mb-5 text-2xs font-semibold uppercase tracking-[.18em] text-muted">
              Or jump straight to a category
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categoriesWithCounts.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-3xl border border-line bg-card p-4 shadow-soft transition-colors hover:border-secondary-300"
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl"
                    style={{ background: category.accentSoft }}
                  >
                    <CrackerArt type={artForCategory(category.slug)} className="h-9 w-9" />
                  </span>
                  <span className="text-xs font-semibold text-dark transition-colors group-hover:text-primary">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
