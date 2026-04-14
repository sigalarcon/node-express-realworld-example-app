import axios from 'axios';

describe('Tags API', () => {
  it('should get tags', async () => {
    const res = await axios.get('/api/tags');

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('tags');
    expect(Array.isArray(res.data.tags)).toBe(true);
    res.data.tags.forEach((tag: unknown) => {
      expect(typeof tag).toBe('string');
    });
  });
});
