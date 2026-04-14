import axios from 'axios';
import { authHeader, createTestArticle, registerUser } from '../support/helpers';

describe('Comments API', () => {
  let token: string;
  let articleSlug: string;
  let commentId: number;

  beforeAll(async () => {
    const user = await registerUser();
    token = user.token;
    const article = await createTestArticle(token);
    articleSlug = article.slug;
  });

  it('should add a comment to an article', async () => {
    const res = await axios.post(
      `/api/articles/${articleSlug}/comments`,
      { comment: { body: 'Great article!' } },
      authHeader(token),
    );

    expect(res.status).toBe(200);
    expect(res.data.comment).toHaveProperty('body', 'Great article!');
    expect(res.data.comment.author).toHaveProperty('username');
    commentId = res.data.comment.id;
  });

  it('should return 422 for empty comment body', async () => {
    const res = await axios.post(
      `/api/articles/${articleSlug}/comments`,
      { comment: { body: '' } },
      { ...authHeader(token), validateStatus: () => true },
    );

    expect(res.status).toBe(422);
  });

  it('should get comments for an article', async () => {
    const res = await axios.get(`/api/articles/${articleSlug}/comments`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('comments');
    expect(Array.isArray(res.data.comments)).toBe(true);
    expect(res.data.comments.length).toBeGreaterThanOrEqual(1);
  });

  it('should delete a comment', async () => {
    const res = await axios.delete(
      `/api/articles/${articleSlug}/comments/${commentId}`,
      authHeader(token),
    );

    expect(res.status).toBe(200);
  });
});
