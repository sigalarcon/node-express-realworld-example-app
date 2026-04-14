import prismaMock from '../prisma-mock';
import {
  addComment,
  createArticle,
  deleteArticle,
  deleteComment,
  favoriteArticle,
  getArticle,
  getArticles,
  getCommentsByArticle,
  getFeed,
  unfavoriteArticle,
  updateArticle,
} from '../../app/routes/article/article.service';

const buildMockArticle = (overrides = {}) => ({
  id: 1,
  authorId: 123,
  slug: 'Test-Title-123',
  title: 'Test Title',
  description: 'Test description',
  body: 'Test body',
  createdAt: new Date(),
  updatedAt: new Date(),
  tagList: [{ name: 'tag1' }],
  author: { username: 'testuser', bio: null, image: null, followedBy: [] },
  favoritedBy: [],
  _count: { favoritedBy: 0 },
  ...overrides,
});

describe('ArticleService', () => {
  describe('deleteComment', () => {
    test('should throw an error ', () => {
      // Given
      const id = 123;
      const idUser = 456;

      // When
      // @ts-ignore
      prismaMock.comment.findFirst.mockResolvedValue(null);

      // Then
      expect(deleteComment(id, idUser)).rejects.toThrowError();
    });
  });

  describe('favoriteArticle', () => {
    test('should return the favorited article', async () => {
      // Given
      const slug = 'How-to-train-your-dragon';
      const username = 'RealWorld';

      const mockedUserResponse = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      const mockedArticleResponse = {
        id: 123,
        slug: 'How-to-train-your-dragon',
        title: 'How to train your dragon',
        description: '',
        body: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 456,
        tagList: [],
        favoritedBy: [],
        author: {
          username: 'RealWorld',
          bio: null,
          image: null,
          followedBy: [],
        },
      };

      // When
      // @ts-ignore
      prismaMock.user.findUnique.mockResolvedValue(mockedUserResponse);
      // @ts-ignore
      prismaMock.article.update.mockResolvedValue(mockedArticleResponse);

      // Then
      await expect(favoriteArticle(slug, mockedUserResponse.id)).resolves.toHaveProperty(
        'favoritesCount',
      );
    });

    test('should throw an error if no user is found', async () => {
      // Given
      const id = 123;
      const slug = 'how-to-train-your-dragon';
      const username = 'RealWorld';

      // When
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Then
      await expect(favoriteArticle(slug, id)).rejects.toThrowError();
    });
  });

  describe('unfavoriteArticle', () => {
    test('should return the unfavorited article', async () => {
      // Given
      const slug = 'How-to-train-your-dragon';
      const username = 'RealWorld';

      const mockedUserResponse = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      const mockedArticleResponse = {
        id: 123,
        slug: 'How-to-train-your-dragon',
        title: 'How to train your dragon',
        description: '',
        body: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 456,
        tagList: [],
        favoritedBy: [],
        author: {
          username: 'RealWorld',
          bio: null,
          image: null,
          followedBy: [],
        },
      };

      // When
      prismaMock.user.findUnique.mockResolvedValue(mockedUserResponse);
      prismaMock.article.update.mockResolvedValue(mockedArticleResponse);

      // Then
      await expect(unfavoriteArticle(slug, mockedUserResponse.id)).resolves.toHaveProperty(
        'favoritesCount',
      );
    });

    test('should throw an error if no user is found', async () => {
      // Given
      const id = 123;
      const slug = 'how-to-train-your-dragon';
      const username = 'RealWorld';

      // When
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Then
      await expect(unfavoriteArticle(slug, id)).rejects.toThrowError();
    });
  });

  describe('createArticle', () => {
    test('should create an article and return it', async () => {
      // Given
      const articleInput = {
        title: 'Test Title',
        description: 'Test description',
        body: 'Test body',
        tagList: ['tag1'],
      };
      const userId = 123;

      // When
      prismaMock.article.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.create.mockResolvedValue(buildMockArticle() as any);

      // Then
      const result = await createArticle(articleInput, userId);
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('tagList');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('favorited');
      expect(result).toHaveProperty('favoritesCount');
    });

    test('should throw an error if title is missing', async () => {
      // Given
      const articleInput = { description: 'desc', body: 'body' };
      const userId = 123;

      // Then
      await expect(createArticle(articleInput, userId)).rejects.toThrowError();
    });

    test('should throw an error if description is missing', async () => {
      // Given
      const articleInput = { title: 'title', body: 'body' };
      const userId = 123;

      // Then
      await expect(createArticle(articleInput, userId)).rejects.toThrowError();
    });

    test('should throw an error if body is missing', async () => {
      // Given
      const articleInput = { title: 'title', description: 'desc' };
      const userId = 123;

      // Then
      await expect(createArticle(articleInput, userId)).rejects.toThrowError();
    });

    test('should throw an error if slug already exists', async () => {
      // Given
      const articleInput = {
        title: 'Test Title',
        description: 'desc',
        body: 'body',
      };
      const userId = 123;

      // When
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findUnique.mockResolvedValue({ slug: 'existing' } as any);

      // Then
      await expect(createArticle(articleInput, userId)).rejects.toThrowError();
    });
  });

  describe('getArticle', () => {
    test('should return an article by slug', async () => {
      // Given
      const slug = 'Test-Title-123';
      const userId = 123;

      // When
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findUnique.mockResolvedValue(buildMockArticle() as any);

      // Then
      const result = await getArticle(slug, userId);
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('author');
    });

    test('should throw an error if article is not found', async () => {
      // Given
      const slug = 'nonexistent';

      // When
      prismaMock.article.findUnique.mockResolvedValue(null);

      // Then
      await expect(getArticle(slug)).rejects.toThrowError();
    });
  });

  describe('updateArticle', () => {
    test('should update an article and return it', async () => {
      // Given
      const articleInput = { title: 'Updated Title' };
      const slug = 'Test-Title-123';
      const userId = 123;

      // When
      prismaMock.article.findFirst
        .mockResolvedValueOnce({
          author: { id: 123, username: 'testuser' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .mockResolvedValueOnce(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.update.mockResolvedValue(buildMockArticle() as any);

      // Then
      const result = await updateArticle(articleInput, slug, userId);
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('title');
    });

    test('should throw an error if article is not found', async () => {
      // Given
      const slug = 'nonexistent';
      const userId = 123;

      // When
      prismaMock.article.findFirst.mockResolvedValue(null);

      // Then
      await expect(updateArticle({ title: 'x' }, slug, userId)).rejects.toThrowError();
    });

    test('should throw an error if user is not the author', async () => {
      // Given
      const slug = 'Test-Title-123';
      const userId = 123;

      // When
      prismaMock.article.findFirst.mockResolvedValue({
        author: { id: 999, username: 'otheruser' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Then
      await expect(updateArticle({ title: 'x' }, slug, userId)).rejects.toThrowError();
    });
  });

  describe('deleteArticle', () => {
    test('should delete an article without error', async () => {
      // Given
      const slug = 'Test-Title-123';
      const userId = 123;

      // When
      prismaMock.article.findFirst.mockResolvedValue({
        author: { id: 123, username: 'testuser' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.delete.mockResolvedValue({} as any);

      // Then
      await expect(deleteArticle(slug, userId)).resolves.not.toThrow();
    });

    test('should throw an error if article is not found', async () => {
      // Given
      const slug = 'nonexistent';
      const userId = 123;

      // When
      prismaMock.article.findFirst.mockResolvedValue(null);

      // Then
      await expect(deleteArticle(slug, userId)).rejects.toThrowError();
    });

    test('should throw an error if user is not the author', async () => {
      // Given
      const slug = 'Test-Title-123';
      const userId = 123;

      // When
      prismaMock.article.findFirst.mockResolvedValue({
        author: { id: 999, username: 'other' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Then
      await expect(deleteArticle(slug, userId)).rejects.toThrowError();
    });
  });

  describe('getArticles', () => {
    test('should return articles and count with no filters', async () => {
      // Given
      const query = {};
      const userId = 123;

      // When
      prismaMock.article.count.mockResolvedValue(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findMany.mockResolvedValue([buildMockArticle()] as any);

      // Then
      const result = await getArticles(query, userId);
      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('articlesCount');
      expect(Array.isArray(result.articles)).toBe(true);
      expect(typeof result.articlesCount).toBe('number');
    });

    test('should return articles filtered by tag', async () => {
      // Given
      const query = { tag: 'dragons' };
      const userId = 123;

      // When
      prismaMock.article.count.mockResolvedValue(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findMany.mockResolvedValue([buildMockArticle()] as any);

      // Then
      const result = await getArticles(query, userId);
      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('articlesCount');
    });

    test('should return articles filtered by author', async () => {
      // Given
      const query = { author: 'testuser' };
      const userId = 123;

      // When
      prismaMock.article.count.mockResolvedValue(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findMany.mockResolvedValue([buildMockArticle()] as any);

      // Then
      await expect(getArticles(query, userId)).resolves.toHaveProperty('articles');
    });

    test('should return articles filtered by favorited', async () => {
      // Given
      const query = { favorited: 'testuser' };
      const userId = 123;

      // When
      prismaMock.article.count.mockResolvedValue(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findMany.mockResolvedValue([buildMockArticle()] as any);

      // Then
      await expect(getArticles(query, userId)).resolves.toHaveProperty('articles');
    });
  });

  describe('getFeed', () => {
    test('should return feed articles and count', async () => {
      // Given
      const offset = 0;
      const limit = 10;
      const userId = 123;

      // When
      prismaMock.article.count.mockResolvedValue(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findMany.mockResolvedValue([buildMockArticle()] as any);

      // Then
      const result = await getFeed(offset, limit, userId);
      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('articlesCount');
    });
  });

  describe('addComment', () => {
    test('should add a comment and return it', async () => {
      // Given
      const body = 'Great article';
      const slug = 'test-slug';
      const userId = 123;

      // When
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.article.findUnique.mockResolvedValue({ id: 1 } as any);
      prismaMock.comment.create.mockResolvedValue({
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        body: 'Great article',
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          followedBy: [],
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Then
      const result = await addComment(body, slug, userId);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('body');
      expect(result).toHaveProperty('author');
    });

    test('should throw an error if body is empty', async () => {
      // Given
      const body = '';
      const slug = 'test-slug';
      const userId = 123;

      // Then
      await expect(addComment(body, slug, userId)).rejects.toThrowError();
    });
  });

  describe('getCommentsByArticle', () => {
    test('should return comments for an article', async () => {
      // Given
      const slug = 'test-slug';
      const userId = 123;

      // When
      prismaMock.article.findUnique.mockResolvedValue({
        comments: [
          {
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            body: 'comment',
            author: {
              username: 'testuser',
              bio: null,
              image: null,
              followedBy: [],
            },
          },
        ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // Then
      const result = await getCommentsByArticle(slug, userId);
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThanOrEqual(1);
      expect(result![0]).toHaveProperty('body');
      expect(result![0]).toHaveProperty('author');
    });
  });
});
