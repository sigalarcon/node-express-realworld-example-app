import axios from 'axios';
import { authHeader, registerUser } from '../support/helpers';

describe('Auth API', () => {
  describe('POST /api/users', () => {
    it('should register a new user', async () => {
      const unique = `${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      const res = await axios.post('/api/users', {
        user: {
          username: `newuser${unique}`,
          email: `newuser${unique}@test.com`,
          password: 'password123',
        },
      });

      expect(res.status).toBe(201);
      expect(res.data.user).toHaveProperty('token');
      expect(res.data.user).toHaveProperty('email');
      expect(res.data.user).toHaveProperty('username');
    });

    it('should return 422 when username is missing', async () => {
      const unique = `${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
      const res = await axios.post(
        '/api/users',
        {
          user: {
            email: `noname${unique}@test.com`,
            password: 'password123',
          },
        },
        { validateStatus: () => true },
      );

      expect(res.status).toBe(422);
    });

    it('should return 422 for duplicate email', async () => {
      const user = await registerUser();
      const res = await axios.post(
        '/api/users',
        {
          user: {
            username: `another${Date.now()}${Math.random().toString(36).substring(2, 8)}`,
            email: user.email,
            password: 'password123',
          },
        },
        { validateStatus: () => true },
      );

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      const user = await registerUser();
      const res = await axios.post('/api/users/login', {
        user: { email: user.email, password: user.password },
      });

      expect(res.status).toBe(200);
      expect(res.data.user).toHaveProperty('token');
    });

    it('should return 403 for wrong password', async () => {
      const user = await registerUser();
      const res = await axios.post(
        '/api/users/login',
        {
          user: { email: user.email, password: 'wrongpassword' },
        },
        { validateStatus: () => true },
      );

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/user', () => {
    it('should return current user with auth', async () => {
      const user = await registerUser();
      const res = await axios.get('/api/user', authHeader(user.token));

      expect(res.status).toBe(200);
      expect(res.data.user).toHaveProperty('username');
    });

    it('should return 401 without auth', async () => {
      const res = await axios.get('/api/user', { validateStatus: () => true });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/user', () => {
    it('should update user bio', async () => {
      const user = await registerUser();
      const res = await axios.put('/api/user', { user: { bio: 'New bio' } }, authHeader(user.token));

      expect(res.status).toBe(200);
      expect(res.data.user.bio).toBe('New bio');
    });
  });
});
