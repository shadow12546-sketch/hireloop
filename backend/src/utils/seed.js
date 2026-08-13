/**
 * Development seed script. Creates a small set of safe, fake demo data:
 * one candidate, one employer + company, one job, one assessment template.
 *
 * Run with: npm run seed
 *
 * NOTE: This is for local development/demo only. Do not run against a
 * production database. No real credentials are used - the seeded
 * password is "Password123!" for BOTH demo accounts (clearly fake).
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
const { ROLES } = require('../constants/roles');
const { JOB_STATUS, WORK_MODE, EMPLOYMENT_TYPE } = require('../constants/jobConstants');

const DEMO_PASSWORD = 'Password123!';

async function seed() {
  await connectDB();
  console.log('[seed] Connected. Clearing existing demo data (by email)...');

  const demoEmails = ['candidate.demo@hireloop.dev', 'employer.demo@hireloop.dev'];
  const existingUsers = await User.find({ email: { $in: demoEmails } });
  const existingUserIds = existingUsers.map((u) => u._id);

  await CandidateProfile.deleteMany({ user: { $in: existingUserIds } });
  await Company.deleteMany({ owner: { $in: existingUserIds } });
  await User.deleteMany({ email: { $in: demoEmails } });
  await Assessment.deleteMany({ title: 'Frontend Fundamentals (Seed)' });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Candidate ---
  const candidateUser = await User.create({
    name: 'Asha Candidate',
    email: 'candidate.demo@hireloop.dev',
    passwordHash,
    role: ROLES.CANDIDATE,
    isEmailVerified: true,
  });

  await CandidateProfile.create({
    user: candidateUser._id,
    phone: '+1-555-0100',
    location: 'Remote',
    bio: 'Aspiring full-stack developer with a passion for building products fast.',
    skills: ['javascript', 'react', 'node.js', 'mongodb'],
    education: [
      {
        institution: 'State University',
        degree: 'B.Sc.',
        fieldOfStudy: 'Computer Science',
        startYear: 2019,
        endYear: 2023,
      },
    ],
    experience: [
      {
        company: 'StartupXYZ',
        title: 'Junior Developer',
        startDate: new Date('2023-06-01'),
        isCurrent: true,
        description: 'Building internal tools with React and Node.js.',
      },
    ],
    links: { github: 'https://github.com/example', linkedin: '', portfolio: '' },
  });

  // --- Employer + Company ---
  const employerUser = await User.create({
    name: 'Sam Employer',
    email: 'employer.demo@hireloop.dev',
    passwordHash,
    role: ROLES.EMPLOYER,
    isEmailVerified: true,
  });

  const company = await Company.create({
    owner: employerUser._id,
    name: 'Acme Technologies',
    description: 'We build tools that help teams move faster.',
    industry: 'Software',
    location: 'Remote',
    website: 'https://acme.example.com',
  });

  // --- Job ---
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  const job = await Job.create({
    title: 'Frontend Engineer (React)',
    description: 'We are looking for a Frontend Engineer to help build our next-generation dashboard product using React and TypeScript.',
    company: company._id,
    location: 'Remote',
    workMode: WORK_MODE.REMOTE,
    employmentType: EMPLOYMENT_TYPE.FULL_TIME,
    salaryMin: 70000,
    salaryMax: 100000,
    experience: '1-3 years',
    skills: ['javascript', 'react', 'css', 'html'],
    deadline,
    status: JOB_STATUS.OPEN,
    createdBy: employerUser._id,
  });

  // --- Assessment template ---
  await Assessment.create({
    title: 'Frontend Fundamentals (Seed)',
    description: 'Basic assessment covering JavaScript and React fundamentals.',
    tags: ['javascript', 'react', 'css', 'html'],
    durationMinutes: 30,
    questions: [
      {
        questionText: 'Which hook is used to manage state in a React functional component?',
        type: 'mcq',
        options: ['useEffect', 'useState', 'useRef', 'useMemo'],
        correctAnswer: 'useState',
        points: 5,
      },
      {
        questionText: 'What does CSS stand for?',
        type: 'mcq',
        options: [
          'Cascading Style Sheets',
          'Creative Style System',
          'Computer Styled Sections',
          'Colorful Style Sheets',
        ],
        correctAnswer: 'Cascading Style Sheets',
        points: 5,
      },
      {
        questionText: 'Briefly explain the difference between `let` and `const` in JavaScript.',
        type: 'short_answer',
        correctAnswer: '',
        points: 10,
      },
    ],
    createdBy: employerUser._id,
  });

  console.log('[seed] Done!');
  console.log('----------------------------------------');
  console.log('Demo candidate login:');
  console.log(`  email: ${candidateUser.email}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log('Demo employer login:');
  console.log(`  email: ${employerUser.email}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log(`Demo job id: ${job._id}`);
  console.log('----------------------------------------');

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
