const request = require('supertest');
const app = require('../src/app');

describe('Auth flow', () => {
  const candidatePayload = {
    name: 'Test Candidate',
    email: 'candidate@test.com',
    password: 'Password123',
    role: 'candidate',
  };

  test('registers a candidate successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(candidatePayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('candidate');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  test('rejects registration with invalid role (no admin allowed)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...candidatePayload, email: 'admin@test.com', role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(candidatePayload);
    const res = await request(app).post('/api/auth/register').send(candidatePayload);
    expect(res.status).toBe(409);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(candidatePayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: candidatePayload.email, password: candidatePayload.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(candidatePayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: candidatePayload.email, password: 'WrongPassword' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me requires authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns current user when authenticated', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(candidatePayload);
    const { accessToken } = registerRes.body.data;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(candidatePayload.email);
  });

  test('refresh token issues a new access token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(candidatePayload);
    const { refreshToken } = registerRes.body.data;

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('logout invalidates refresh token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send(candidatePayload);
    const { accessToken, refreshToken } = registerRes.body.data;

    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
  });
});
