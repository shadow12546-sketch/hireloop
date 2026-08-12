const request = require('supertest');
const app = require('../src/app');

async function registerAndLogin({ name, email, password = 'Password123', role }) {
  const res = await request(app).post('/api/auth/register').send({ name, email, password, role });
  return res.body.data; // { user, accessToken, refreshToken }
}

async function createCandidate(overrides = {}) {
  return registerAndLogin({
    name: 'Candidate User',
    email: `candidate_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`,
    role: 'candidate',
    ...overrides,
  });
}

async function createEmployer(overrides = {}) {
  return registerAndLogin({
    name: 'Employer User',
    email: `employer_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`,
    role: 'employer',
    ...overrides,
  });
}

async function createCompanyForEmployer(accessToken, overrides = {}) {
  const res = await request(app)
    .put('/api/companies/me')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name: 'Test Company',
      description: 'A company for testing',
      industry: 'Software',
      location: 'Remote',
      website: 'https://example.com',
      ...overrides,
    });
  return res.body.data.company;
}

async function createJobForEmployer(accessToken, overrides = {}) {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 15);

  const res = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      title: 'Software Engineer',
      description: 'We are hiring a software engineer to join our growing team.',
      workMode: 'remote',
      employmentType: 'full-time',
      skills: ['javascript', 'node.js'],
      deadline: deadline.toISOString(),
      ...overrides,
    });
  return res.body;
}

module.exports = {
  app,
  request,
  registerAndLogin,
  createCandidate,
  createEmployer,
  createCompanyForEmployer,
  createJobForEmployer,
};
