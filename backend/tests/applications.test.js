const {
  app,
  request,
  createCandidate,
  createEmployer,
  createCompanyForEmployer,
  createJobForEmployer,
} = require('./helpers');

async function uploadDummyResume(accessToken) {
  const res = await request(app)
    .post('/api/resumes/upload')
    .set('Authorization', `Bearer ${accessToken}`)
    .attach('resume', Buffer.from('%PDF-1.4 fake pdf content for testing'), {
      filename: 'resume.pdf',
      contentType: 'application/pdf',
    });
  return res.body;
}

describe('Application flow', () => {
  async function setupJobAndCandidate() {
    const employer = await createEmployer();
    await createCompanyForEmployer(employer.accessToken);
    const jobResult = await createJobForEmployer(employer.accessToken);
    const job = jobResult.data.job;

    const candidate = await createCandidate();
    await uploadDummyResume(candidate.accessToken);

    return { employer, job, candidate };
  }

  test('candidate can apply to an open job', async () => {
    const { job, candidate } = await setupJobAndCandidate();

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId: job._id });

    expect(res.status).toBe(201);
    expect(res.body.data.application.status).toBe('APPLIED');
  });

  test('candidate cannot apply without an uploaded resume', async () => {
    const employer = await createEmployer();
    await createCompanyForEmployer(employer.accessToken);
    const jobResult = await createJobForEmployer(employer.accessToken);
    const job = jobResult.data.job;

    const candidate = await createCandidate(); // no resume uploaded

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId: job._id });

    expect(res.status).toBe(400);
  });

  test('prevents duplicate application to the same job', async () => {
    const { job, candidate } = await setupJobAndCandidate();

    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId: job._id });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId: job._id });

    expect(res.status).toBe(409);
  });

  test('employer cannot apply to a job (candidate-only)', async () => {
    const { job } = await setupJobAndCandidate();
    const otherEmployer = await createEmployer();

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${otherEmployer.accessToken}`)
      .send({ jobId: job._id });

    expect(res.status).toBe(403);
  });

  test('rejects application to a job past its deadline', async () => {
    const employer = await createEmployer();
    await createCompanyForEmployer(employer.accessToken);

    // Create job with a valid future deadline, then manually expire it via update
    const jobResult = await createJobForEmployer(employer.accessToken);
    const jobId = jobResult.data.job._id;

    await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({ status: 'EXPIRED' });

    const candidate = await createCandidate();
    await uploadDummyResume(candidate.accessToken);

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId });

    expect(res.status).toBe(400);
  });

  test('employer can view applicants for their own job', async () => {
    const { job, candidate, employer } = await setupJobAndCandidate();

    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId: job._id });

    const res = await request(app)
      .get(`/api/applications/job/${job._id}`)
      .set('Authorization', `Bearer ${employer.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.applications.length).toBe(1);
  });

  test('candidate can view their own applications', async () => {
    const { job, candidate } = await setupJobAndCandidate();

    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId: job._id });

    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${candidate.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.applications.length).toBe(1);
  });
});

describe('Application status transitions', () => {
  async function setupApplication() {
    const employer = await createEmployer();
    await createCompanyForEmployer(employer.accessToken);
    const jobResult = await createJobForEmployer(employer.accessToken);
    const job = jobResult.data.job;

    const candidate = await createCandidate();
    await uploadDummyResume(candidate.accessToken);

    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .send({ jobId: job._id });

    return { employer, job, candidate, application: appRes.body.data.application };
  }

  test('employer can advance APPLIED -> SCREENING', async () => {
    const { employer, application } = await setupApplication();

    const res = await request(app)
      .patch(`/api/applications/${application._id}/advance`)
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({ toStatus: 'SCREENING' });

    expect(res.status).toBe(200);
    expect(res.body.data.application.status).toBe('SCREENING');
  });

  test('rejects invalid transition (APPLIED -> AI_INTERVIEW directly)', async () => {
    const { employer, application } = await setupApplication();

    const res = await request(app)
      .patch(`/api/applications/${application._id}/advance`)
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({ toStatus: 'AI_INTERVIEW' });

    expect(res.status).toBe(400);
  });

  test('automatic assessment assignment when reaching ASSESSMENT stage', async () => {
    const { employer, application } = await setupApplication();

    // Create an assessment template first
    await request(app)
      .post('/api/assessments/templates')
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({
        title: 'Test Assessment',
        tags: ['javascript', 'node.js'],
        questions: [
          { questionText: 'What is 2+2?', type: 'mcq', options: ['3', '4'], correctAnswer: '4', points: 5 },
        ],
      });

    await request(app)
      .patch(`/api/applications/${application._id}/advance`)
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({ toStatus: 'SCREENING' });
    await request(app)
      .patch(`/api/applications/${application._id}/advance`)
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({ toStatus: 'SHORTLISTED' });
    const res = await request(app)
      .patch(`/api/applications/${application._id}/advance`)
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({ toStatus: 'ASSESSMENT' });

    expect(res.status).toBe(200);
    expect(res.body.data.application.assignedAssessmentAttempt).toBeTruthy();
  });

  test('employer cannot set OFFER via advance endpoint (must use decision endpoint)', async () => {
    const { employer, application } = await setupApplication();

    const res = await request(app)
      .patch(`/api/applications/${application._id}/advance`)
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .send({ toStatus: 'OFFER' });

    expect(res.status).toBe(400);
  });
});
