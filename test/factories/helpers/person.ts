import { faker } from '@faker-js/faker';

/**
 * Generates a random first name.
 *
 * @returns A string representing a first name.
 */
export function firstName(): string {
  return faker.person.firstName();
}

/**
 * Generates a random last name.
 *
 * @returns A string representing a last name.
 */
export function lastName(): string {
  return faker.person.lastName();
}

/**
 * Generates a random full name (first name + last name).
 *
 * @returns A string representing a full name.
 */
export function fullName(): string {
  return faker.person.fullName();
}

/**
 * Generates a random phone number.
 *
 * @returns A string representing a phone number.
 */
export function phone(): string {
  return faker.phone.number();
}
