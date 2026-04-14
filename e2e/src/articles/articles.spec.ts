import axios from 'axios';
import { authHeader, registerUser } from '../support/helpers';

describe('Articles API', () => {
  let token: string;
  let username: string;
  let articleSlug: string;

  beforeAll(async () => {
    const user = await registerUser();
    token = user.token;
    username = user.username;
  });

  describe('POST /api/articles', () => {
    it('should create an article', async () => {
      const unique = `${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      const res = await axios.post(
        '/api/articles',
        {
          article: {
            title: `Test Article ${unique}`,
            description: 'Test description',
            body: 'Test body content',
            tagList: ['test'],
          },
        },
        authHeader(token),
      );

      expect(res.status).toBe(201);
      expect(res.data.article).toHaveProperty('slug');
      expect(res.data.article).toHaveProperty('title');
      expect(res.data.article).toHaveProperty('tagList');
      articleSlug = res.data.article.slug;
    });

    it('should return 422 when title is missing', async () => {
      const res = await axios.post(
        '/api/articles',
        {
          article: {
            description: 'Test description',
            body: 'Test body content',
          },
        },
        { ...authHeader(token), validateStatus: () => true },
      );

      expect(res.status).toBe(422);
    });

    it('should return 401 without auth', async () => {
      const res = await axios.post(
        '/api/articles',
        {
          article: {
            title: 'No Auth Article',
            description: 'Test',
            body: 'Test',
          },
        },
        { validateStatus: () => true },
      );

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/articles', () => {
    it('should list articles', async () => {
      const res = await axios.get('/api/articles', authHeader(token));

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('articles');
      expect(Array.isArray(res.data.articles)).toBe(true);
      expect(res.data).toHaveProperty('articlesCount');
      expect(typeof res.data.articlesCount).toBe('number');
    });

    it('should filter articles by tag', async () => {
      const res = await axios.get('/api/articles?tag=test', authHeader(token));

      expect(res.status).toBe(200);
      expect(res.data.articles.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter articles by author', async () => {
      const res = await axios.get(`/api/articles?author=${username}`, authHeader(token));

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/articles/:slug', () => {
    it('should get an article by slug', async () => {
      const res = await axios.get(`/api/articles/${articleSlug}`);

      expect(res.status).toBe(200);
      expect(res.data.article).toHaveProperty('title');
    });

    it('should return 404 for nonexistent slug', async () => {
      const res = await axios.get('/api/articles/nonexistent-slug-12345', {
        validateStatus: () => true,
      });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/articles/:slug', () => {
    it('should update an article', async () => {
      const res = await axios.put(
        `/api/articles/${articleSlug}`,
        { article: { title: 'Updated Title' } },
        authHeader(token),
      );

      expect(res.status).toBe(200);
      expect(res.data.article.title).toBe('Updated Title');
      articleSlug = res.data.article.slug;
    });

    it('should return 401 without auth', async () => {
      const res = await axios.put(
        `/api/articles/${articleSlug}`,
        { article: { title: 'Unauthorized Update' } },
        { validateStatus: () => true },
      );

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/articles/feed', () => {
    it('should get feed with auth', async () => {
      const res = await axios.get('/api/articles/feed', authHeader(token));

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('articles');
      expect(Array.isArray(res.data.articles)).toBe(true);
      expect(res.data).toHaveProperty('articlesCount');
    });

    it('should return 401 without auth', async () => {
      const res = await axios.get('/api/articles/feed', { validateStatus: () => true });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/articles/:slug', () => {
    it('should return 401 without auth', async () => {
      const res = await axios.delete(`/api/articles/${articleSlug}`, {
        validateStatus: () => true,
      });

      expect(res.status).toBe(401);
    });

    it('should delete an article', async () => {
      const res = await axios.delete(`/api/articles/${articleSlug}`, authHeader(token));

      expect(res.status).toBe(204);
    });
  });
});
