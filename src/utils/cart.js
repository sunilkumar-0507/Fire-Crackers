/**
 * Catalogue entities → cart line items.
 *
 * The cart stores a denormalised copy of everything it needs to render, so the
 * drawer never has to look anything up in the catalogue. Keeping the mapping
 * here means there is exactly one definition of a line item's shape.
 */

export const toCartItem = (product) => ({
  id: product.id,
  kind: 'product',
  slug: product.slug,
  name: product.name,
  unit: product.unit,
  price: product.price,
  mrp: product.mrp,
  image: product.images?.[0],
  category: product.category,
  stock: product.stock,
  tags: product.tags ?? [],
});

export const comboToCartItem = (combo) => ({
  id: combo.id,
  kind: 'combo',
  slug: combo.slug,
  name: combo.name,
  unit: `${combo.itemCount} items · ${combo.serves}`,
  price: combo.price,
  mrp: combo.mrp,
  image: `${combo.art}/1`,
  category: 'combo-packs',
  stock: combo.stock,
  tags: ['combo'],
});

/** Route for a line item — combos and products live on different pages. */
export const cartItemHref = (item) =>
  item.kind === 'combo' ? `/combo/${item.slug}` : `/product/${item.slug}`;
