import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { featuredProducts, categoriesWithCounts } from '@/data';
import Section, { SectionHeading } from '@/components/ui/Section';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

/**
 * Featured shelf with inline category filtering. Only categories that actually
 * have featured products get a chip, so no filter can ever return zero.
 */
export const FeaturedProducts = () => {
  const [filter, setFilter] = useState('all');

  const availableFilters = useMemo(() => {
    const present = new Set(featuredProducts.map((p) => p.category));
    return categoriesWithCounts.filter((c) => present.has(c.slug));
  }, []);

  const visible = useMemo(
    () =>
      (filter === 'all' ? featuredProducts : featuredProducts.filter((p) => p.category === filter)).slice(0, 8),
    [filter],
  );

  return (
    <Section id="featured" className="bg-gradient-to-b from-transparent via-white/40 to-transparent">
      <div className="container">
        <SectionHeading
          eyebrow="Hand-picked"
          title="What we'd put in our own basket"
          description="The ones we make the most of, sell the most of, and get the fewest complaints about. Filter by category or add straight from the card."
          action={
            <Button to="/products" variant="outline" rightIcon={<ArrowRight size={16} />}>
              See everything
            </Button>
          }
        />

        <div className="hide-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-8 sm:flex-wrap sm:px-0">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')} count={featuredProducts.length}>
            All
          </Chip>
          {availableFilters.map((category) => (
            <Chip
              key={category.id}
              active={filter === category.slug}
              onClick={() => setFilter(category.slug)}
              count={featuredProducts.filter((p) => p.category === category.slug).length}
            >
              {category.name}
            </Chip>
          ))}
        </div>

        <ProductGrid products={visible} />
      </div>
    </Section>
  );
};

export default FeaturedProducts;
