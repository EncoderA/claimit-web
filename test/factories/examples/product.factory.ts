import { BaseFactory, DeepPartial } from '../base.factory';
import * as TextHelper from '../helpers/text';
import * as CompanyHelper from '../helpers/company';
import * as NumberHelper from '../helpers/number';

/**
 * Represents a commerce product in the system.
 */
export interface Product {
  /** The unique identifier of the product */
  id: string;
  /** The name of the product */
  name: string;
  /** A detailed description of the product */
  description: string;
  /** The base selling price of the product */
  price: number;
  /** The discounted price of the product, if applicable */
  discountPrice?: number;
  /** The commercial department or category */
  category: string;
  /** Availability flag */
  inStock: boolean;
  /** The timestamp when the product was added to inventory */
  createdAt: Date;
}

/**
 * Factory class for creating Product entities.
 */
class ProductFactoryClass extends BaseFactory<Product> {
  /**
   * Defines default values for Product properties.
   *
   * @returns A default Product entity.
   */
  protected define(): Product {
    return {
      id: this.uuid(),
      name: TextHelper.word(),
      description: TextHelper.description(),
      price: NumberHelper.float({ min: 10, max: 1000, fractionDigits: 2 }),
      category: CompanyHelper.department(),
      inStock: this.randomBoolean({ probability: 0.85 }),
      createdAt: this.pastDate(),
    };
  }

  /**
   * Helper to build a product with a calculated discount price.
   *
   * @param discountPercent - The percentage discount to apply, e.g. 0.2 for 20% (default is 0.2).
   * @param overrides - Optional overrides to apply.
   * @returns A Product entity with a calculated `discountPrice` field.
   *
   * @example
   * ```ts
   * const product = ProductFactory.discounted(0.15, { price: 100.00 });
   * // product.price = 100.00, product.discountPrice = 85.00
   * ```
   */
  public discounted(discountPercent = 0.2, overrides?: DeepPartial<Product>): Product {
    const baseProduct = this.build(overrides);
    const discountPrice = parseFloat((baseProduct.price * (1 - discountPercent)).toFixed(2));
    return {
      ...baseProduct,
      discountPrice,
    };
  }
}

/**
 * Singleton instance of ProductFactoryClass. Use this to construct mock Product data.
 */
export const ProductFactory = new ProductFactoryClass();
