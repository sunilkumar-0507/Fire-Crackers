import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from '@/components/ui/icons';
import { categoriesWithCounts } from '@/data';
import { useUIStore } from '@/store/uiStore';
import ProductImage from '@/components/ui/ProductImage';
import Button from '@/components/ui/Button';

export const NotFound = () => {
  const navigate = useNavigate();
  const openSearch = useUIStore((s) => s.openSearch);

  return (
    <div className="relative flex min-h-[calc(100svh-var(--header-h))] items-center overflow-hidden py-12 sm:py-16">
      <div className="container relative">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
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
                  <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white">
                    <ProductImage
                      source={category.cover}
                      alt=""
                      className="h-full w-full"
                      imgClassName="p-1"
                    />
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
