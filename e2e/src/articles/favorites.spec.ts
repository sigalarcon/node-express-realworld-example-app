import axios from 'axios';
import { authHeader, createTestArticle, registerUser } from '../support/helpers';

describe('Favorites API', () => {
  let token: string;
  let articleSlug: string;

  beforeAll(async () => {
    const user = await registerUser();
    token = user.token;
    const article = await createTestArticle(token);
    articleSlug = article.slug;
  });

  it('should favorite an article', async () => {
    const res = await axios.post(
      `/api/articles/${articleSlug}/favorite`,
      {},
      authHeader(token),
    );

    expect(res.status).toBe(200);
    expect(res.data.article.favorited).toBe(true);
    expect(res.data.article.favoritesCount).toBe(1);
  });

  it('should unfavorite an article', async () => {
    const res = await axios.delete(
      `/api/articles/${articleSlug}/favorite`,
      authHeader(token),
    );

    expect(res.status).toBe(200);
    expect(res.data.article.favorited).toBe(false);
    expect(res.data.article.favoritesCount).toBe(0);
  });

  it('should return 401 when favoriting without auth', async () => {
    const res = await axios.post(
      `/api/articles/${articleSlug}/favorite`,
      {},
      { validateStatus: () => true },
    );

    expect(res.status).toBe(401);
  });
});
