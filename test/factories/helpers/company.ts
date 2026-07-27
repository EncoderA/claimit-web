import { faker } from '@faker-js/faker';

/**
 * Generates a random company name.
 *
 * @returns A string representing a company name.
 */
export function companyName(): string {
  return faker.company.name();
}

/**
 * Generates a random department name.
 *
 * @returns A string representing a department.
 */
export function department(): string {
  return faker.commerce.department();
}

/**
 * Generates a random job title.
 *
 * @returns A string representing a job title.
 */
export function jobTitle(): string {
  return faker.person.jobTitle();
}
