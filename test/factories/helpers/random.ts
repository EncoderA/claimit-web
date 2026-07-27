import { faker } from '@faker-js/faker';

/**
 * Generates a random boolean value.
 *
 * @param options - Custom options such as true-value probability.
 * @returns A boolean value.
 */
export function boolean(options?: { probability?: number }): boolean {
  const probability = options?.probability ?? 0.5;
  return faker.datatype.boolean(probability);
}

/**
 * Picks a random value from a TypeScript enum.
 *
 * @param enumObj - A TypeScript enum object.
 * @returns A random value from the enum object.
 */
export function enumElement<T extends Record<string, any>>(enumObj: T): T[keyof T] {
  return faker.helpers.arrayElement(Object.values(enumObj)) as T[keyof T];
}

/**
 * Selects a random element from a given array.
 *
 * @param array - A read-only array of items.
 * @returns A single random item from the array.
 */
export function arrayElement<T>(array: readonly T[]): T {
  return faker.helpers.arrayElement(array);
}

/**
 * Selects a random subset of elements from a given array.
 *
 * @param array - A read-only array of items.
 * @param count - The number of items to pick or a range.
 * @returns A subset of the original array.
 */
export function arrayElements<T>(array: readonly T[], count?: number | { min: number; max: number }): T[] {
  return faker.helpers.arrayElements(array, count);
}
