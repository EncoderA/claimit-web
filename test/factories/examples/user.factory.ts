import { BaseFactory, DeepPartial } from '../base.factory';
import * as PersonHelper from '../helpers/person';
import * as InternetHelper from '../helpers/internet';

/**
 * Represents a user in the application.
 */
export interface User {
  /** The unique identifier for the user (UUID) */
  id: string;
  /** The unique username */
  username: string;
  /** The unique email address */
  email: string;
  /** The first name of the user */
  firstName: string;
  /** The last name of the user */
  lastName: string;
  /** The URL to the user's avatar image */
  avatar: string;
  /** The role within the application */
  role: 'admin' | 'user' | 'moderator';
  /** The timestamp when the user account was created */
  createdAt: Date;
}

/**
 * Factory class for creating User entities.
 * Extends BaseFactory to provide user generation capabilities.
 */
class UserFactoryClass extends BaseFactory<User> {
  /**
   * Defines default values for User properties.
   * Uses Person and Internet helpers for names, emails, and avatars.
   *
   * @returns A default User entity.
   */
  protected define(): User {
    const fName = PersonHelper.firstName();
    const lName = PersonHelper.lastName();
    const username = InternetHelper.username({ firstName: fName, lastName: lName });
    const email = InternetHelper.email({ firstName: fName, lastName: lName });

    return {
      id: this.uuid(),
      username: `${username}_${this.sequence()}`, // Ensure username uniqueness in tests
      email,
      firstName: fName,
      lastName: lName,
      avatar: InternetHelper.avatar(),
      role: 'user',
      createdAt: this.pastDate(),
    };
  }

  /**
   * Expressive helper to build a user with an 'admin' role.
   *
   * @param overrides - Optional property overrides to apply.
   * @returns A User entity with 'admin' role.
   *
   * @example
   * ```ts
   * const admin = UserFactory.admin({ firstName: 'Alice' });
   * ```
   */
  public admin(overrides?: DeepPartial<User>): User {
    return this.build({ role: 'admin', ...overrides });
  }

  /**
   * Expressive helper to build a user with a 'moderator' role.
   *
   * @param overrides - Optional property overrides to apply.
   * @returns A User entity with 'moderator' role.
   */
  public moderator(overrides?: DeepPartial<User>): User {
    return this.build({ role: 'moderator', ...overrides });
  }
}

/**
 * Singleton instance of UserFactoryClass. Use this to construct mock User data.
 */
export const UserFactory = new UserFactoryClass();
