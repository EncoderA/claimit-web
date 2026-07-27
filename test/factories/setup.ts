import { faker } from '@faker-js/faker';
import { beforeEach } from 'vitest';

import { BaseFactory } from './base.factory';

/** The default seed value used to guarantee test determinism. */
export const DEFAULT_SEED = 42;

/**
 * Seeds the Faker instance to ensure reproducible data generation.
 *
 * @param seed - The numeric seed to set. Defaults to DEFAULT_SEED (42).
 */
export function seedFaker(seed: number = DEFAULT_SEED): void {
  faker.seed(seed);
  BaseFactory.resetAll();
}

// Immediately seed Faker on import
seedFaker(DEFAULT_SEED);

// Automatically re-seed before each test case to ensure test isolation
if (typeof beforeEach === 'function') {
  beforeEach(() => {
    seedFaker(DEFAULT_SEED);
  });
}
