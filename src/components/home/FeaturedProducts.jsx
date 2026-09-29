import { useMemo, useState } from 'react';
import { ArrowRight, Search, Star } from '@/components/ui/icons';
import { products, categoriesWithCounts } from '@/data';
import Section, { SectionHeading } from '@/components/ui/Section';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import { useUIStore } from '@/store/uiStore';

/**
 * Catalogue shelf with inline category filtering. It stops at `SHELF_SIZE`
 * cards so the rest of the homepage stays reachable, and hands off to the full
 * listing below the grid. Only categories that actually have products get a
 * chip, so no filter can ever return zero.
 */
// 36 fills whole rows at two, three and four columns.
const SHELF_SIZE = 36;

export const FeaturedProducts = () => {
  const [filter, setFilter] = useState('all');
  const openSearch = useUIStore((s) => s.openSearch);

  const availableFilters = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return categoriesWithCounts.filter((c) => present.has(c.slug));
  }, [products]);

  const visible = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => p.category === filter)).slice(0, SHELF_SIZE),
    [filter, products],
  );

  return (
    <Section id="featured" className="bg-gradient-to-b from-transparent via-white/40 to-transparent">
      <div className="container">
        <SectionHeading
          eyebrow="Hand-picked"
          icon={<Star size={13} />}
          title="What we'd put in our own basket"
          description="The ones we make the most of, sell the most of, and get the fewest complaints about. Filter by category or add straight from the card."
          action={
            <Button onClick={openSearch} variant="outline" leftIcon={<Search size={16} />}>
              Search
            </Button>
          }
        />

        <div className="hide-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-8 sm:flex-wrap sm:px-0">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')} count={products.length}>
            All
          </Chip>
          {availableFilters.map((category) => (
            <Chip
              key={category.id}
              active={filter === category.slug}
              onClick={() => setFilter(category.slug)}
              count={category.productCount}
            >
              {category.name}
            </Chip>
          ))}
        </div>

        <ProductGrid products={visible} paginate />

        <div className="mt-8 flex justify-center sm:mt-10">
          <Button
            to={filter === 'all' ? '/products' : `/category/${filter}`}
            size="lg"
            rightIcon={<ArrowRight size={16} />}
          >
            See everything
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default FeaturedProducts;
