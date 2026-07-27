import { faker } from '@faker-js/faker';

/**
 * Generates a random email address.
 *
 * @param options - Custom options for first name, last name, or provider.
 * @returns A string representing an email address.
 */
export function email(options?: { firstName?: string; lastName?: string; provider?: string }): string {
  return faker.internet.email(options);
}

/**
 * Generates a random username.
 *
 * @param options - Custom options for first name or last name.
 * @returns A string representing a username.
 */
export function username(options?: { firstName?: string; lastName?: string }): string {
  return faker.internet.username(options);
}

/**
 * Generates a random secure password.
 *
 * @param options - Custom options for length, pattern, prefix, etc.
 * @returns A string representing a password.
 */
export function password(options?: { length?: number; memorable?: boolean; pattern?: RegExp; prefix?: string }): string {
  return faker.internet.password(options);
}

/**
 * Generates a random web URL.
 *
 * @returns A string representing a URL.
 */
export function url(): string {
  return faker.internet.url();
}

/**
 * Generates a random avatar image URL.
 *
 * @returns A string representing an avatar URL.
 */
export function avatar(): string {
  return faker.image.avatar();
}
