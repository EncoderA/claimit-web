import { faker } from '@faker-js/faker';

/**
 * A pinned reference date to ensure date-based randomness is completely deterministic
 * and does not drift with the system clock during test runs.
 */
export const DEFAULT_REF_DATE = new Date('2026-01-01T00:00:00.000Z');

/**
 * Generates a random future date.
 *
 * @param options - Custom options for range (years) or reference date.
 * @returns A Date object in the future.
 */
export function future(options?: { years?: number; refDate?: string | Date | number }): Date {
  return faker.date.future({ refDate: DEFAULT_REF_DATE, ...options });
}

/**
 * Generates a random past date.
 *
 * @param options - Custom options for range (years) or reference date.
 * @returns A Date object in the past.
 */
export function past(options?: { years?: number; refDate?: string | Date | number }): Date {
  return faker.date.past({ refDate: DEFAULT_REF_DATE, ...options });
}

/**
 * Generates a random recent date.
 *
 * @param options - Custom options for range (days) or reference date.
 * @returns A Date object within recent days.
 */
export function recent(options?: { days?: number; refDate?: string | Date | number }): Date {
  return faker.date.recent({ refDate: DEFAULT_REF_DATE, ...options });
}
