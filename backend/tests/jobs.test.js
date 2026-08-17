const {
  app,
  request,
  createCandidate,
  createEmployer,
  createCompanyForEmployer,
  createJobForEmployer,
} = require('./helpers');

describe('Job creation and authorization', () => {
  test('employer can create a job after creating a company', async () => {
    const employer = await createEmployer();
    await createCompanyForEmployer(employer.accessToken);

    const result = await createJobForEmployer(employer.accessToken);
    expect(result.success).toBe(true);
    expect(result.data.job.title).toBe('Software Engineer');
    expect(result.data.job.status).toBe('OPEN');
  });

  test('employer cannot create a job without a company profile', async () => {
    const employer = await createEmployer();
    const Company = require('../src/models/Company');
    await Company.deleteMany({ owner: employer.user._id || employer.user.id });
    const result = await createJobForEmployer(employer.accessToken);
    expect(result.success).toBe(false);
  });

  test('candidate cannot create a job (employer-only)', async () => {
    const candidate = await createCandidate();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 10);

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({
        title: 'Should Fail',
        description: 'Candidates should not be able to create jobs at all.',
        workMode: 'remote',
        employmentType: 'full-time',
        deadline: deadline.toISOString(),
      });

    expect(res.status).toBe(403);
  });

  test('candidate can view jobs (list)', async () => {
    const employer = await createEmployer();
    await createCompanyForEmployer(employer.accessToken);
    await createJobForEmployer(employer.accessToken);

    const candidate = await createCandidate();
    const res = await request(app).get('/api/jobs').set('Authorization', `Bearer ${candidate.accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.jobs)).toBe(true);
    expect(res.body.data.jobs.length).toBeGreaterThanOrEqual(1);
  });

  test('only the owning employer can update their job', async () => {
    const employer1 = await createEmployer();
    await createCompanyForEmployer(employer1.accessToken);
    const jobResult = await createJobForEmployer(employer1.accessToken);
    const jobId = jobResult.data.job._id;

    const employer2 = await createEmployer();
    await createCompanyForEmployer(employer2.accessToken, { name: 'Other Co' });

    const res = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${employer2.accessToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
  });

  test('rejects job creation with a deadline in the past', async () => {
    const employer = await createEmployer();
    await createCompanyForEmployer(employer.accessToken);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({
        title: 'Expired Job',
        description: 'This job has a deadline in the past and should be rejected.',
        workMode: 'remote',
        employmentType: 'full-time',
        deadline: pastDate.toISOString(),
      });

    expect(res.status).toBe(400);
  });
});
