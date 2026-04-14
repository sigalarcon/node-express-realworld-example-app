import axios from 'axios';

export const registerUser = async (overrides: Record<string, unknown> = {}) => {
  const unique = `${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
  const userData = {
    username: `testuser${unique}`,
    email: `test${unique}@test.com`,
    password: 'password123',
    ...overrides,
  };
  const res = await axios.post('/api/users', { user: userData });
  return { ...res.data.user, password: userData.password };
};

export const loginUser = async (email: string, password: string) => {
  const res = await axios.post('/api/users/login', { user: { email, password } });
  return res.data.user;
};

export const authHeader = (token: string) => ({
  headers: { Authorization: `Token ${token}` },
});

export const createTestArticle = async (token: string, overrides: Record<string, unknown> = {}) => {
  const unique = `${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
  const articleData = {
    title: `Test Article ${unique}`,
    description: 'Test description',
    body: 'Test body content',
    tagList: ['test'],
    ...overrides,
  };
  const res = await axios.post('/api/articles', { article: articleData }, authHeader(token));
  return res.data.article;
};
