import { useMemo, useState } from 'react';
import { ArrowRight, Star } from '@/components/ui/icons';
import { products, categoriesWithCounts } from '@/data';
import Section, { SectionHeading } from '@/components/ui/Section';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

/**
 * Catalogue shelf with inline category filtering. "All" is the whole catalogue;
 * the grid paginates as you scroll so the first paint stays cheap. Only
 * categories that actually have products get a chip, so no filter can ever
 * return zero.
 */
export const FeaturedProducts = () => {
  const [filter, setFilter] = useState('all');

  const availableFilters = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return categoriesWithCounts.filter((c) => present.has(c.slug));
  }, [products]);

  const visible = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => p.category === filter)),
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
            <Button to="/products" variant="outline" rightIcon={<ArrowRight size={16} />}>
              See everything
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
      </div>
    </Section>
  );
};

export default FeaturedProducts;
