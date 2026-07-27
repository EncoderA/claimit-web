import { describe, it, expect } from 'vitest';
import {
  UserFactory,
  PostFactory,
  CommentFactory,
  ProductFactory,
  seedFaker,
} from './index';

describe('Test Factory Architecture Suite', () => {
  describe('BaseFactory - Simple Entities & Overrides', () => {
    it('should build a single entity with default attributes', () => {
      const user = UserFactory.build();
      
      expect(user).toBeDefined();
      expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i); // UUID pattern
      expect(user.role).toBe('user');
      expect(user.email).toContain('@');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should build a single entity with partial overrides', () => {
      const user = UserFactory.build({
        firstName: 'John',
        role: 'moderator',
      });

      expect(user.firstName).toBe('John');
      expect(user.role).toBe('moderator');
      // Other values should remain randomized/default
      expect(user.lastName).toBeDefined();
      expect(user.email).toContain('@');
    });

    it('should support expressive helper methods on factories', () => {
      const admin = UserFactory.admin({ firstName: 'AdminUser' });
      expect(admin.role).toBe('admin');
      expect(admin.firstName).toBe('AdminUser');

      const mod = UserFactory.moderator();
      expect(mod.role).toBe('moderator');
    });
  });

  describe('BaseFactory - List Building', () => {
    it('should build a list of entities with buildList using defaults', () => {
      const users = UserFactory.buildList(5);

      expect(users).toBeInstanceOf(Array);
      expect(users).toHaveLength(5);
      users.forEach((user) => {
        expect(user.role).toBe('user');
        expect(user.email).toContain('@');
      });
    });

    it('should build a list of entities with buildMany', () => {
      const users = UserFactory.buildMany(3);

      expect(users).toHaveLength(3);
    });

    it('should build a list of entities with static overrides', () => {
      const users = UserFactory.buildList(3, { role: 'admin' });

      expect(users).toHaveLength(3);
      users.forEach((user) => {
        expect(user.role).toBe('admin');
      });
    });

    it('should build a list of entities with a dynamic override callback', () => {
      const users = UserFactory.buildList(3, (index) => ({
        firstName: `UserNumber${index}`,
      }));

      expect(users).toHaveLength(3);
      expect(users[0].firstName).toBe('UserNumber0');
      expect(users[1].firstName).toBe('UserNumber1');
      expect(users[2].firstName).toBe('UserNumber2');
    });
  });

  describe('Nested Factories & Composition', () => {
    it('should automatically instantiate nested factories in defaults', () => {
      const post = PostFactory.build();

      expect(post.author).toBeDefined();
      expect(post.authorId).toBe(post.author.id);
      expect(post.author.role).toBe('user');
    });

    it('should allow shallow overrides of primitive fields in compose factories', () => {
      const post = PostFactory.build({
        title: 'Custom Title',
      });

      expect(post.title).toBe('Custom Title');
      expect(post.author).toBeDefined();
      expect(post.authorId).toBe(post.author.id);
    });

    it('should support deep merging of nested overrides without replacing other default nested fields', () => {
      const post = PostFactory.build({
        author: {
          role: 'admin',
          firstName: 'Alice',
        },
      });

      // The author object should merge 'admin' and 'Alice' with other defaults, rather than overwrite the whole object
      expect(post.author.role).toBe('admin');
      expect(post.author.firstName).toBe('Alice');
      expect(post.author.lastName).toBeDefined();
      expect(post.author.email).toContain('@');

      // The relationship ID hook should sync the foreign key correctly
      expect(post.authorId).toBe(post.author.id);
    });

    it('should handle completely overridden nested entity instances', () => {
      const customAuthor = UserFactory.admin({ id: 'custom-admin-id' });
      const post = PostFactory.build({
        author: customAuthor,
      });

      expect(post.author.id).toBe('custom-admin-id');
      expect(post.author.role).toBe('admin');
      expect(post.authorId).toBe('custom-admin-id');
    });

    it('should support multiple nested factories correctly (Double nesting)', () => {
      const comment = CommentFactory.build({
        content: 'This is a comment.',
        author: { firstName: 'Commenter' },
        post: { title: 'Target Post' },
      });

      expect(comment.content).toBe('This is a comment.');
      expect(comment.author.firstName).toBe('Commenter');
      expect(comment.post.title).toBe('Target Post');

      // Check foreign key syncing
      expect(comment.authorId).toBe(comment.author.id);
      expect(comment.postId).toBe(comment.post.id);
      // Ensure the nested post's author is also fully initialized
      expect(comment.post.author).toBeDefined();
      expect(comment.post.authorId).toBe(comment.post.author.id);
    });
  });

  describe('Custom Business Logic (e.g. ProductFactory)', () => {
    it('should compute default values cleanly', () => {
      const product = ProductFactory.build();

      expect(product.price).toBeGreaterThan(0);
      expect(product.discountPrice).toBeUndefined();
      expect(product.category).toBeDefined();
    });

    it('should compute discounted prices correctly using custom builder method', () => {
      const product = ProductFactory.discounted(0.2, { price: 100.0 }); // 20% discount

      expect(product.price).toBe(100.0);
      expect(product.discountPrice).toBe(80.0);
    });
  });

  describe('Faker Seed - Deterministic Testing', () => {
    it('should generate identical results with the same seed', () => {
      seedFaker(12345);
      const user1_run1 = UserFactory.build();
      const user2_run1 = UserFactory.build();

      seedFaker(12345);
      const user1_run2 = UserFactory.build();
      const user2_run2 = UserFactory.build();

      // Assert complete identity of values due to deterministic seeding
      expect(user1_run1).toEqual(user1_run2);
      expect(user2_run1).toEqual(user2_run2);
    });

    it('should generate different results with different seeds', () => {
      seedFaker(100);
      const user1 = UserFactory.build();

      seedFaker(200);
      const user2 = UserFactory.build();

      // They should differ
      expect(user1.username).not.toBe(user2.username);
    });
  });
});
