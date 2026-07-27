import { faker } from '@faker-js/faker';

/**
 * Generates a random integer.
 *
 * @param options - Custom options for min and max bounds.
 * @returns A random integer.
 */
export function integer(options?: { min?: number; max?: number }): number {
  return faker.number.int(options);
}

/**
 * Generates a random float.
 *
 * @param options - Custom options for min, max bounds, and precision.
 * @returns A random floating point number.
 */
export function float(options?: { min?: number; max?: number; multipleOf?: number; fractionDigits?: number }): number {
  return faker.number.float(options);
}
