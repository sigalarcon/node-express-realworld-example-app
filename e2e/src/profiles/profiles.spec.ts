import axios from 'axios';
import { authHeader, registerUser } from '../support/helpers';

describe('Profiles API', () => {
  let tokenA: string;
  let usernameB: string;

  beforeAll(async () => {
    const userA = await registerUser();
    tokenA = userA.token;
    const userB = await registerUser();
    usernameB = userB.username;
  });

  it('should get a profile without auth', async () => {
    const res = await axios.get(`/api/profiles/${usernameB}`);

    expect(res.status).toBe(200);
    expect(res.data.profile).toHaveProperty('username', usernameB);
    expect(res.data.profile.following).toBe(false);
  });

  it('should get a profile with auth', async () => {
    const res = await axios.get(`/api/profiles/${usernameB}`, authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.data.profile.following).toBe(false);
  });

  it('should follow a user', async () => {
    const res = await axios.post(
      `/api/profiles/${usernameB}/follow`,
      {},
      authHeader(tokenA),
    );

    expect(res.status).toBe(200);
    expect(res.data.profile.following).toBe(true);
  });

  it('should show following status after follow', async () => {
    const res = await axios.get(`/api/profiles/${usernameB}`, authHeader(tokenA));

    expect(res.status).toBe(200);
    expect(res.data.profile.following).toBe(true);
  });

  it('should unfollow a user', async () => {
    const res = await axios.delete(
      `/api/profiles/${usernameB}/follow`,
      authHeader(tokenA),
    );

    expect(res.status).toBe(200);
    expect(res.data.profile.following).toBe(false);
  });

  it('should return 401 when following without auth', async () => {
    const res = await axios.post(
      `/api/profiles/${usernameB}/follow`,
      {},
      { validateStatus: () => true },
    );

    expect(res.status).toBe(401);
  });
});
