import { BaseFactory, DeepPartial } from '../base.factory';
import * as TextHelper from '../helpers/text';
import { User, UserFactory } from './user.factory';

/**
 * Represents a post in the application.
 */
export interface Post {
  /** The unique identifier of the post */
  id: string;
  /** The title of the post */
  title: string;
  /** The content of the post */
  content: string;
  /** The publishing status */
  status: 'draft' | 'published';
  /** Foreign key pointing to the author */
  authorId: string;
  /** The author object (nested relationship) */
  author: User;
  /** The timestamp when the post was created */
  createdAt: Date;
}

/**
 * Factory class for creating Post entities.
 * Demonstrates nested factory composition and relationship key syncing.
 */
class PostFactoryClass extends BaseFactory<Post> {
  /**
   * Defines default values for Post properties.
   * Dynamically constructs a nested User model as the author.
   *
   * @returns A default Post entity.
   */
  protected define(): Post {
    const author = UserFactory.build();
    return {
      id: this.uuid(),
      title: TextHelper.title(),
      content: TextHelper.paragraph(),
      status: 'draft',
      authorId: author.id,
      author,
      createdAt: this.pastDate(),
    };
  }

  /**
   * Override of base `build` to ensure relationship IDs are in sync when custom authors are provided.
   * If the author is overridden, authorId is set to match the overridden author.id.
   *
   * @param overrides - Post attribute overrides.
   * @returns A constructed Post entity.
   */
  public override build(overrides?: DeepPartial<Post>): Post {
    const post = super.build(overrides);
    // If the author was overridden in build, sync the foreign key
    if (overrides?.author) {
      post.authorId = post.author.id;
    }
    return post;
  }

  /**
   * Helper to build a published post.
   *
   * @param overrides - Optional overrides to apply.
   * @returns A published Post entity.
   *
   * @example
   * ```ts
   * const post = PostFactory.published({ title: 'My First Post' });
   * ```
   */
  public published(overrides?: DeepPartial<Post>): Post {
    return this.build({ status: 'published', ...overrides });
  }

  /**
   * Helper to build a draft post.
   *
   * @param overrides - Optional overrides to apply.
   * @returns A draft Post entity.
   */
  public draft(overrides?: DeepPartial<Post>): Post {
    return this.build({ status: 'draft', ...overrides });
  }
}

/**
 * Singleton instance of PostFactoryClass. Use this to construct mock Post data.
 */
export const PostFactory = new PostFactoryClass();
