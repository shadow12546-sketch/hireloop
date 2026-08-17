/**
 * Development seed script. Creates a rich set of safe, fake demo data:
 * Multiple candidates, employers, companies, jobs, and mock applications.
 *
 * Run with: npm run seed
 *
 * NOTE: This is for local development/demo only. Do not run against a
 * production database. No real credentials are used - the seeded
 * password is "Password123!" for all demo accounts.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Assessment = require('../models/Assessment');
const Application = require('../models/Application');
const Resume = require('../models/Resume');

const { ROLES } = require('../constants/roles');
const { JOB_STATUS, WORK_MODE, EMPLOYMENT_TYPE } = require('../constants/jobConstants');
const { APPLICATION_STATUS } = require('../constants/applicationConstants');

const DEMO_PASSWORD = 'Password123!';

async function seed() {
  await connectDB();
  console.log('[seed] Connected. Clearing existing demo data...');

  const demoEmails = [
    'candidate.demo@hireloop.dev',
    'candidate2@hireloop.dev',
    'candidate3@hireloop.dev',
    'employer.demo@hireloop.dev',
    'employer2@hireloop.dev'
  ];

  const existingUsers = await User.find({ email: { $in: demoEmails } });
  const existingUserIds = existingUsers.map((u) => u._id);

  await CandidateProfile.deleteMany({ user: { $in: existingUserIds } });
  await Company.deleteMany({ owner: { $in: existingUserIds } });
  await Job.deleteMany({ createdBy: { $in: existingUserIds } });
  await Application.deleteMany({ candidate: { $in: existingUserIds } });
  await Resume.deleteMany({ candidate: { $in: existingUserIds } });
  await User.deleteMany({ email: { $in: demoEmails } });
  await Assessment.deleteMany({ title: 'Frontend Fundamentals (Seed)' });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Create Candidates ---
  const candidateUsersData = [
    { name: 'Asha Candidate', email: 'candidate.demo@hireloop.dev', role: ROLES.CANDIDATE },
    { name: 'Bob Builder', email: 'candidate2@hireloop.dev', role: ROLES.CANDIDATE },
    { name: 'Charlie Code', email: 'candidate3@hireloop.dev', role: ROLES.CANDIDATE }
  ];

  const candidateUsers = await Promise.all(candidateUsersData.map(c => 
    User.create({ ...c, passwordHash, isEmailVerified: true })
  ));

  const candidateProfilesData = [
    {
      user: candidateUsers[0]._id,
      phone: '+1-555-0100',
      location: 'Remote',
      bio: 'Aspiring full-stack developer with a passion for building products fast.',
      skills: ['javascript', 'react', 'node.js', 'mongodb'],
      experience: [{ company: 'StartupXYZ', title: 'Junior Developer', startDate: new Date('2023-06-01'), isCurrent: true, description: 'Building internal tools with React and Node.js.' }]
    },
    {
      user: candidateUsers[1]._id,
      phone: '+1-555-0200',
      location: 'New York, NY',
      bio: 'Senior Backend Engineer experienced in microservices.',
      skills: ['python', 'django', 'aws', 'docker'],
      experience: [{ company: 'TechCorp', title: 'Backend Engineer', startDate: new Date('2020-01-15'), isCurrent: true, description: 'Architecting Python APIs.' }]
    },
    {
      user: candidateUsers[2]._id,
      phone: '+1-555-0300',
      location: 'San Francisco, CA',
      bio: 'UI/UX Designer who loves crafting beautiful interfaces.',
      skills: ['figma', 'css', 'html', 'tailwind'],
      experience: [{ company: 'DesignStudio', title: 'UI Designer', startDate: new Date('2021-03-01'), isCurrent: true, description: 'Designing web and mobile apps.' }]
    }
  ];

  await Promise.all(candidateProfilesData.map(p => CandidateProfile.create(p)));

  // Mock Resumes for candidates
  const resumes = await Promise.all(candidateUsers.map(user => 
    Resume.create({
      candidate: user._id,
      fileId: new mongoose.Types.ObjectId(), // Fake GridFS fileId
      originalFilename: 'resume.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024 * 500, // 500KB
    })
  ));

  // --- Create Employers & Companies ---
  const employerUsersData = [
    { name: 'Sam Employer', email: 'employer.demo@hireloop.dev', role: ROLES.EMPLOYER },
    { name: 'Alice HR', email: 'employer2@hireloop.dev', role: ROLES.EMPLOYER }
  ];

  const employerUsers = await Promise.all(employerUsersData.map(e => 
    User.create({ ...e, passwordHash, isEmailVerified: true })
  ));

  const companiesData = [
    { owner: employerUsers[0]._id, name: 'Acme Technologies', description: 'We build tools that help teams move faster.', industry: 'Software', location: 'Remote', website: 'https://acme.example.com' },
    { owner: employerUsers[1]._id, name: 'Global Finance', description: 'Modern financial solutions.', industry: 'Finance', location: 'New York, NY', website: 'https://globalfinance.example.com' }
  ];

  const companies = await Promise.all(companiesData.map(c => Company.create(c)));

  // --- Create Jobs ---
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  const jobsData = [
    { title: 'Frontend Engineer (React)', description: 'Looking for a Frontend Engineer.', company: companies[0]._id, location: 'Remote', workMode: WORK_MODE.REMOTE, employmentType: EMPLOYMENT_TYPE.FULL_TIME, salaryMin: 70000, salaryMax: 100000, experience: '1-3 years', skills: ['javascript', 'react', 'css', 'html'], deadline, status: JOB_STATUS.OPEN, createdBy: employerUsers[0]._id },
    { title: 'Backend Developer (Python)', description: 'Join our backend team.', company: companies[0]._id, location: 'Remote', workMode: WORK_MODE.REMOTE, employmentType: EMPLOYMENT_TYPE.FULL_TIME, salaryMin: 90000, salaryMax: 130000, experience: '3-5 years', skills: ['python', 'django', 'postgresql'], deadline, status: JOB_STATUS.OPEN, createdBy: employerUsers[0]._id },
    { title: 'Senior UI/UX Designer', description: 'Design our next generation product.', company: companies[1]._id, location: 'New York, NY', workMode: WORK_MODE.HYBRID, employmentType: EMPLOYMENT_TYPE.FULL_TIME, salaryMin: 80000, salaryMax: 120000, experience: '5+ years', skills: ['figma', 'design systems'], deadline, status: JOB_STATUS.OPEN, createdBy: employerUsers[1]._id },
    { title: 'DevOps Engineer', description: 'Maintain our infrastructure.', company: companies[1]._id, location: 'New York, NY', workMode: WORK_MODE.ONSITE, employmentType: EMPLOYMENT_TYPE.CONTRACT, salaryMin: 100000, salaryMax: 150000, experience: '3-5 years', skills: ['aws', 'docker', 'kubernetes'], deadline, status: JOB_STATUS.OPEN, createdBy: employerUsers[1]._id },
    { title: 'Product Manager', description: 'Lead our product strategy.', company: companies[0]._id, location: 'Remote', workMode: WORK_MODE.REMOTE, employmentType: EMPLOYMENT_TYPE.FULL_TIME, salaryMin: 110000, salaryMax: 160000, experience: '5+ years', skills: ['product management', 'agile'], deadline, status: JOB_STATUS.CLOSED, createdBy: employerUsers[0]._id },
  ];

  const jobs = await Promise.all(jobsData.map(j => Job.create(j)));

  // --- Create Assessment template ---
  await Assessment.create({
    title: 'Frontend Fundamentals (Seed)',
    description: 'Basic assessment covering JavaScript and React fundamentals.',
    tags: ['javascript', 'react', 'css', 'html'],
    durationMinutes: 30,
    questions: [
      { questionText: 'Which hook is used to manage state in a React functional component?', type: 'mcq', options: ['useEffect', 'useState', 'useRef', 'useMemo'], correctAnswer: 'useState', points: 5 },
      { questionText: 'What does CSS stand for?', type: 'mcq', options: ['Cascading Style Sheets', 'Creative Style System', 'Computer Styled Sections', 'Colorful Style Sheets'], correctAnswer: 'Cascading Style Sheets', points: 5 },
    ],
    createdBy: employerUsers[0]._id,
  });

  // --- Create Mock Applications ---
  // Asha applies to Frontend Job
  await Application.create({
    candidate: candidateUsers[0]._id,
    job: jobs[0]._id,
    resume: resumes[0]._id,
    status: APPLICATION_STATUS.APPLIED,
  });

  // Asha applies to Backend Job
  await Application.create({
    candidate: candidateUsers[0]._id,
    job: jobs[1]._id,
    resume: resumes[0]._id,
    status: APPLICATION_STATUS.REJECTED,
  });

  // Bob applies to Backend Job
  await Application.create({
    candidate: candidateUsers[1]._id,
    job: jobs[1]._id,
    resume: resumes[1]._id,
    status: APPLICATION_STATUS.SHORTLISTED,
  });

  // Charlie applies to UI/UX Job
  await Application.create({
    candidate: candidateUsers[2]._id,
    job: jobs[2]._id,
    resume: resumes[2]._id,
    status: APPLICATION_STATUS.SCREENING,
  });

  console.log('[seed] Done!');
  console.log('----------------------------------------');
  console.log('Demo Candidates:');
  candidateUsers.forEach(c => console.log(`  email: ${c.email} | pass: ${DEMO_PASSWORD}`));
  console.log('Demo Employers:');
  employerUsers.forEach(e => console.log(`  email: ${e.email} | pass: ${DEMO_PASSWORD}`));
  console.log('----------------------------------------');

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
