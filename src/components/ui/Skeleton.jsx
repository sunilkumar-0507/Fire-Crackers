import { cn } from '@/utils/cn';

export const Skeleton = ({ className, ...rest }) => (
  <div className={cn('skeleton', className)} aria-hidden="true" {...rest} />
);

export const ProductCardSkeleton = ({ className }) => (
  <div className={cn('surface overflow-hidden p-3', className)}>
    <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
    <div className="space-y-2.5 px-1 pb-1 pt-4">
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-4 w-4/5 rounded-full" />
      <Skeleton className="h-3 w-2/3 rounded-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  </div>
);

export const CategoryCardSkeleton = ({ className }) => (
  <div className={cn('surface overflow-hidden p-5', className)}>
    <Skeleton className="mx-auto aspect-square w-24 rounded-3xl" />
    <div className="space-y-2 pt-5">
      <Skeleton className="h-4 w-3/5 rounded-full" />
      <Skeleton className="h-3 w-2/5 rounded-full" />
    </div>
  </div>
);

export const SearchResultSkeleton = ({ className }) => (
  <div className={cn('flex items-center gap-4 rounded-2xl p-3', className)}>
    <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/5 rounded-full" />
      <Skeleton className="h-3 w-2/5 rounded-full" />
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="container grid gap-10 py-12 lg:grid-cols-2">
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-4xl" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-20 rounded-2xl" />
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="h-9 w-4/5 rounded-full" />
      <Skeleton className="h-4 w-1/3 rounded-full" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-12 w-2/3 rounded-full" />
    </div>
  </div>
);

/** Full-page fallback used by the lazy route Suspense boundary. */
export const PageSkeleton = () => (
  <div className="container space-y-8 py-20">
    <Skeleton className="h-4 w-32 rounded-full" />
    <Skeleton className="h-12 w-2/3 rounded-2xl" />
    <Skeleton className="h-4 w-1/2 rounded-full" />
    <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;
