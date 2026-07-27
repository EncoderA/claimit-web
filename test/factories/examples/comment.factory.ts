import { BaseFactory, DeepPartial } from '../base.factory';
import * as TextHelper from '../helpers/text';
import { User, UserFactory } from './user.factory';
import { Post, PostFactory } from './post.factory';

/**
 * Represents a comment on a post in the application.
 */
export interface Comment {
  /** The unique identifier of the comment */
  id: string;
  /** The text content of the comment */
  content: string;
  /** Foreign key pointing to the comment author */
  authorId: string;
  /** The author object (nested relationship) */
  author: User;
  /** Foreign key pointing to the target post */
  postId: string;
  /** The post object (nested relationship) */
  post: Post;
  /** The timestamp when the comment was created */
  createdAt: Date;
}

/**
 * Factory class for creating Comment entities.
 * Demonstrates multiple nested factories and foreign key synchronization.
 */
class CommentFactoryClass extends BaseFactory<Comment> {
  /**
   * Defines default values for Comment properties.
   * Dynamically constructs nested User and Post models.
   *
   * @returns A default Comment entity.
   */
  protected define(): Comment {
    const author = UserFactory.build();
    const post = PostFactory.build();

    return {
      id: this.uuid(),
      content: TextHelper.sentence(),
      authorId: author.id,
      author,
      postId: post.id,
      post,
      createdAt: this.pastDate(),
    };
  }

  /**
   * Override of base `build` to ensure relationship IDs are in sync when custom authors or posts are provided.
   *
   * @param overrides - Comment attribute overrides.
   * @returns A constructed Comment entity.
   */
  public override build(overrides?: DeepPartial<Comment>): Comment {
    const comment = super.build(overrides);
    // Sync keys if they were custom overridden
    if (overrides?.author) {
      comment.authorId = comment.author.id;
    }
    if (overrides?.post) {
      comment.postId = comment.post.id;
    }
    return comment;
  }
}

/**
 * Singleton instance of CommentFactoryClass. Use this to construct mock Comment data.
 */
export const CommentFactory = new CommentFactoryClass();
