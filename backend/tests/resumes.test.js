const { app, request, createCandidate, createEmployer } = require('./helpers');

describe('Resume upload', () => {
  test('candidate can upload a valid PDF resume', async () => {
    const candidate = await createCandidate();

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .attach('resume', Buffer.from('%PDF-1.4 fake pdf content'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.resume.originalFilename).toBe('resume.pdf');
  });

  test('rejects invalid file type (e.g. .exe / image mimetype)', async () => {
    const candidate = await createCandidate();

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .attach('resume', Buffer.from('not a resume'), {
        filename: 'malware.exe',
        contentType: 'application/x-msdownload',
      });

    expect(res.status).toBe(400);
  });

  test('rejects upload with no file attached', async () => {
    const candidate = await createCandidate();

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${candidate.accessToken}`);

    expect(res.status).toBe(400);
  });

  test('employer cannot upload a resume (candidate-only)', async () => {
    const employer = await createEmployer();

    const res = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${employer.accessToken}`)
      .attach('resume', Buffer.from('%PDF-1.4 fake pdf content'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(403);
  });

  test('candidate can download their own uploaded resume', async () => {
    const candidate = await createCandidate();

    const uploadRes = await request(app)
      .post('/api/resumes/upload')
      .set('Authorization', `Bearer ${candidate.accessToken}`)
      .attach('resume', Buffer.from('%PDF-1.4 fake pdf content'), {
        filename: 'resume.pdf',
        contentType: 'application/pdf',
      });

    const resumeId = uploadRes.body.data.resume.id;

    const downloadRes = await request(app)
      .get(`/api/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${candidate.accessToken}`);

    expect(downloadRes.status).toBe(200);
  });
});
