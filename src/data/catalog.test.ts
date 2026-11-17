import { describe, expect, it } from 'vitest';
import { CATEGORIES, formatPrice, PRODUCTS, RESTAURANTS } from './catalog';

describe('product catalog', () => {
  it('contains uniquely identified products with positive prices', () => {
    const ids = PRODUCTS.map((product) => product.id);

    expect(PRODUCTS.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(PRODUCTS.every((product) => product.price > 0)).toBe(true);
  });

  it('formats prices with two decimal places', () => {
    expect(formatPrice(7.5)).toBe('$7.50');
  });

  it('uses local photos and excludes the removed diet category', () => {
    expect(PRODUCTS.every((product) => Boolean(product.image))).toBe(true);
    expect(CATEGORIES).not.toContain('Dietas');
  });

  it('includes restaurant location, cuisine, price, and map information', () => {
    expect(RESTAURANTS.length).toBeGreaterThan(0);
    expect(
      RESTAURANTS.every(
        (restaurant) =>
          restaurant.category === 'Restaurantes' &&
          restaurant.address.length > 0 &&
          restaurant.neighborhood.length > 0 &&
          restaurant.cuisine.length > 0 &&
          restaurant.priceRange.length > 0 &&
          Boolean(restaurant.mapUrl),
      ),
    ).toBe(true);
  });
});
