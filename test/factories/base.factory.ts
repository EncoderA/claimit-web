import { faker } from '@faker-js/faker';
import * as TextHelper from './helpers/text';
import * as DateHelper from './helpers/date';
import * as PersonHelper from './helpers/person';
import * as InternetHelper from './helpers/internet';
import * as CompanyHelper from './helpers/company';
import * as NumberHelper from './helpers/number';
import * as RandomHelper from './helpers/random';

/**
 * A recursive partial type that makes all properties of an object and its nested objects optional.
 * Excludes built-in types like Date, RegExp, Function, and Error from being recursed into.
 */
export type DeepPartial<T> = T extends Date | RegExp | Function | Error
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

/**
 * An abstract base class for creating type-safe test factories.
 * Inspired by Fishery, it provides deep merging, list generation, and sequence management.
 *
 * Concrete factories should extend this class and implement the `define` method.
 *
 * @template T - The type of entity the factory constructs.
 *
 * @example
 * ```ts
 * class UserFactoryClass extends BaseFactory<User> {
 *   protected define(): User {
 *     return {
 *       id: this.uuid(),
 *       name: PersonHelper.fullName(),
 *       email: InternetHelper.email(),
 *     };
 *   }
 * }
 * export const UserFactory = new UserFactoryClass();
 * ```
 */
export abstract class BaseFactory<T> {
  private static readonly instances: BaseFactory<any>[] = [];
  private sequenceCounter = 0;

  constructor() {
    BaseFactory.instances.push(this);
  }

  /**
   * Resets the sequence counter for this factory instance.
   */
  public reset(): void {
    this.sequenceCounter = 0;
  }

  /**
   * Resets the sequence counters of all registered factories.
   */
  public static resetAll(): void {
    for (const instance of BaseFactory.instances) {
      instance.reset();
    }
  }

  /**
   * Defines the sensible defaults for the entity.
   * Concrete subclasses must implement this method.
   *
   * @returns The default attributes of type T.
   */
  protected abstract define(): T;

  /**
   * Returns a unique auto-incrementing integer for this factory instance.
   * Useful for ensuring unique usernames, sequential IDs, or sorted properties.
   *
   * @returns An incremented integer.
   */
  protected sequence(): number {
    this.sequenceCounter += 1;
    return this.sequenceCounter;
  }

  /**
   * Generates a random standard UUID.
   *
   * @returns A standard UUID string.
   */
  protected uuid(): string {
    return faker.string.uuid();
  }

  /**
   * Generates a random boolean value based on a true-value probability.
   *
   * @param options - Custom options including the probability (between 0.0 and 1.0) of being true.
   * @returns A boolean.
   */
  protected randomBoolean(options?: { probability?: number }): boolean {
    return RandomHelper.boolean(options);
  }

  /**
   * Selects a random value from a TypeScript enum object.
   *
   * @template E - The enum type.
   * @param enumObj - A TypeScript enum object.
   * @returns A random value of the enum.
   */
  protected randomEnum<E extends Record<string, any>>(enumObj: E): E[keyof E] {
    return RandomHelper.enumElement(enumObj);
  }

  /**
   * Selects a single random item from a given array.
   *
   * @template I - Element type.
   * @param array - A read-only array of items.
   * @returns A single random element from the array.
   */
  protected randomItem<I>(array: readonly I[]): I {
    return RandomHelper.arrayElement(array);
  }

  /**
   * Selects a random subset of elements from a given array.
   *
   * @template I - Element type.
   * @param array - A read-only array of items.
   * @param count - The number of items to pick or a range.
   * @returns A subset of the original array.
   */
  protected randomItems<I>(array: readonly I[], count?: number | { min: number; max: number }): I[] {
    return RandomHelper.arrayElements(array, count);
  }

  /**
   * Conditionally returns a value or the output of a function based on a given probability,
   * otherwise returns undefined. Useful for optional fields.
   *
   * @template K - Value type.
   * @param value - The value or function returning the value.
   * @param probability - The probability (default 0.5) of returning the value.
   * @returns The resolved value, or undefined.
   */
  protected maybe<K>(value: K | (() => K), probability = 0.5): K | undefined {
    return this.randomBoolean({ probability })
      ? (typeof value === 'function' ? (value as () => K)() : value)
      : undefined;
  }

  /**
   * Selects one of the provided values at random.
   *
   * @template K - Value type.
   * @param values - Variadic arguments representing potential values.
   * @returns One of the provided values.
   */
  protected oneOf<K>(...values: K[]): K {
    return this.randomItem(values);
  }

  /**
   * Generates a random future date.
   *
   * @param options - Custom options for the time range and reference date.
   * @returns A Date object in the future.
   */
  protected futureDate(options?: { years?: number; refDate?: string | Date | number }): Date {
    return DateHelper.future(options);
  }

  /**
   * Generates a random past date.
   *
   * @param options - Custom options for the time range and reference date.
   * @returns A Date object in the past.
   */
  protected pastDate(options?: { years?: number; refDate?: string | Date | number }): Date {
    return DateHelper.past(options);
  }

  /**
   * Generates a random recent date.
   *
   * @param options - Custom options for range (days) or reference date.
   * @returns A Date object within recent days.
   */
  protected recentDate(options?: { days?: number; refDate?: string | Date | number }): Date {
    return DateHelper.recent(options);
  }

  /**
   * Builds a single instance of the entity.
   * Merges the factory's default attributes with the provided overrides.
   * Recursively deep merges objects while avoiding replacing them completely.
   *
   * @param overrides - Optional deep partial properties of type T to override the default attributes.
   * @returns The fully constructed entity of type T.
   *
   * @example
   * ```ts
   * const guest = UserFactory.build();
   * const admin = UserFactory.build({ role: 'admin' });
   * ```
   */
  public build(overrides?: DeepPartial<T>): T {
    const defaults = this.define();
    return this.merge(defaults, overrides);
  }

  /**
   * Builds an array of entities of the specified length.
   * Merges each with optional overrides, which can either be a static object or a callback
   * function that receives the current loop index.
   *
   * @param count - The number of entities to construct.
   * @param overrides - Optional static deep partial overrides or dynamic callback index function.
   * @returns An array of built entities of type T.
   *
   * @example
   * ```ts
   * // Static overrides
   * const users = UserFactory.buildList(3, { role: 'moderator' });
   *
   * // Dynamic overrides using callback
   * const usersWithNames = UserFactory.buildList(3, (i) => ({
   *   username: `user_${i}`
   * }));
   * ```
   */
  public buildList(count: number, overrides?: DeepPartial<T> | ((index: number) => DeepPartial<T>)): T[] {
    return Array.from({ length: count }, (_, index) => {
      const activeOverrides =
        typeof overrides === 'function'
          ? (overrides as (index: number) => DeepPartial<T>)(index)
          : overrides;
      return this.build(activeOverrides);
    });
  }

  /**
   * An expressive alias of `buildList` for creating a list of entities using standard defaults.
   *
   * @param count - The number of entities to construct.
   * @returns An array of built entities of type T.
   *
   * @example
   * ```ts
   * const defaultUsers = UserFactory.buildMany(5);
   * ```
   */
  public buildMany(count: number): T[] {
    return this.buildList(count);
  }

  /**
   * Safely merges default attributes with user overrides.
   *
   * @param defaults - The default attributes generated by the factory.
   * @param overrides - The user-provided overrides.
   * @returns The merged entity.
   */
  private merge(defaults: T, overrides?: DeepPartial<T>): T {
    if (!overrides) {
      return defaults;
    }
    return this.deepMerge(defaults, overrides);
  }

  /**
   * Recursively deep merges objects. Arrays are overwritten rather than concatenated.
   *
   * @param target - The destination object.
   * @param source - The source object.
   * @returns The deep-merged object.
   */
  private deepMerge(target: any, source: any): any {
    if (source === undefined || source === null) {
      return target;
    }
    if (typeof source !== 'object' || Array.isArray(source)) {
      return source;
    }
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = this.deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
    return result;
  }
}
