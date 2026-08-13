/**
 * Mock Data — Development Only
 *
 * This file is the single source of truth for all mock/seed data used
 * when NEXT_PUBLIC_USE_MOCK=true (i.e., backend is not yet available).
 *
 * ⚠️  Do NOT import this file in production service logic.
 *     Services conditionally import it only when IS_MOCK === true.
 *
 * Organized by entity domain. All IDs use a consistent prefix scheme.
 */

// ─── Users ────────────────────────────────────────────────────────────────────

export const mockUsers = [
  { id: "usr_1", name: "Sachin Verma",    email: "sachin@platform.com",  role: "Candidate",       status: "Active",   created: "2026-01-15" },
  { id: "usr_2", name: "Muskan Recruiter",email: "muskan@acme.com",      role: "Recruiter",       status: "Active",   created: "2026-03-01" },
  { id: "usr_3", name: "Jane Manager",    email: "jane@acme.com",        role: "Hiring Manager",  status: "Active",   created: "2026-03-22" },
  { id: "usr_4", name: "Tom Interviewer", email: "tom@acme.com",         role: "Interviewer",     status: "Active",   created: "2026-04-10" },
  { id: "usr_5", name: "Super Admin",     email: "admin@platform.com",   role: "Super Admin",     status: "Active",   created: "2026-01-01" },
]

// ─── Candidates ───────────────────────────────────────────────────────────────

export const mockCandidates = [
  {
    id: "cnd_1",
    name: "John Doe",
    email: "john@gmail.com",
    phone: "+1 234 567 890",
    location: "San Francisco, CA",
    role: "Senior React Developer",
    matchScore: 92,
    experience: "5 years",
    appliedDate: "2026-08-01",
    status: "Interview",
    avatar: "J",
    skills: ["React", "TypeScript", "Node.js", "Redux"],
    resumeUrl: null, // will be populated from backend
  },
  {
    id: "cnd_2",
    name: "Jane Smith",
    email: "jane@gmail.com",
    phone: "+1 345 678 901",
    location: "New York, NY",
    role: "Product Manager",
    matchScore: 88,
    experience: "7 years",
    appliedDate: "2026-08-02",
    status: "Shortlisted",
    avatar: "J",
    skills: ["Product Strategy", "Roadmapping", "SQL"],
    resumeUrl: null,
  },
  {
    id: "cnd_3",
    name: "Alice Johnson",
    email: "alice@gmail.com",
    phone: "+1 456 789 012",
    location: "Austin, TX",
    role: "UX Designer",
    matchScore: 95,
    experience: "4 years",
    appliedDate: "2026-08-03",
    status: "Applied",
    avatar: "A",
    skills: ["Figma", "User Research", "Prototyping"],
    resumeUrl: null,
  },
]

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const mockJobs = [
  {
    id: "job_1",
    title: "Senior React Developer",
    department: "Engineering",
    company: "Acme Corp",
    location: "Remote",
    type: "Full-time",
    experience: "3-5 years",
    salary: "$120k – $150k",
    applications: 45,
    status: "Active",
    created: "2026-07-15",
    deadline: "2026-08-30",
    description: "We are looking for an experienced React developer to join our core product team.",
    requirements: ["3+ years React", "Strong TypeScript skills", "Experience with state management"],
    skills: ["React", "TypeScript", "Redux"],
  },
  {
    id: "job_2",
    title: "Product Manager",
    department: "Product",
    company: "Acme Corp",
    location: "New York, NY",
    type: "Full-time",
    experience: "5+ years",
    salary: "$130k – $160k",
    applications: 120,
    status: "Active",
    created: "2026-07-10",
    deadline: "2026-08-15",
    description: "Lead product discovery and strategy for our enterprise product line.",
    requirements: ["5+ years PM experience", "B2B product experience", "SQL proficiency"],
    skills: ["Product Strategy", "SQL", "Analytics"],
  },
  {
    id: "job_3",
    title: "UX Designer",
    department: "Design",
    company: "Acme Corp",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "2-4 years",
    salary: "$100k – $130k",
    applications: 85,
    status: "Closed",
    created: "2026-06-01",
    deadline: "2026-07-01",
    description: "Design beautiful, accessible experiences for our core product.",
    requirements: ["Figma mastery", "User research experience", "Design systems knowledge"],
    skills: ["Figma", "User Research", "Design Systems"],
  },
]

// ─── Applications ─────────────────────────────────────────────────────────────

export const mockApplications = [
  {
    id: "app_1",
    candidateId: "cnd_1",
    jobId: "job_1",
    jobTitle: "Senior React Developer",
    company: "Acme Corp",
    appliedDate: "2026-08-01",
    status: "Interview",
    currentStage: 3,
    stages: ["Applied", "Screening", "Interview", "Offer"],
    matchScore: 92,
  },
  {
    id: "app_2",
    candidateId: "cnd_2",
    jobId: "job_2",
    jobTitle: "Product Manager",
    company: "Acme Corp",
    appliedDate: "2026-08-02",
    status: "Screening",
    currentStage: 1,
    stages: ["Applied", "Screening", "Interview", "Offer"],
    matchScore: 88,
  },
]

// ─── Interviews ───────────────────────────────────────────────────────────────

export const mockInterviews = [
  {
    id: "int_1",
    applicationId: "app_1",
    candidateId: "cnd_1",
    candidate: "John Doe",
    role: "Senior React Developer",
    company: "Acme Corp",
    interviewer: "Tom Interviewer",
    date: "2026-08-12",
    time: "10:00 AM",
    type: "Technical",
    status: "Scheduled",
    link: "https://zoom.us/j/123456789",
  },
]

// ─── Assessments ──────────────────────────────────────────────────────────────

export const mockAssessments = [
  {
    id: "ass_1",
    title: "Frontend Technical Assessment",
    candidateId: "cnd_1",
    candidate: "John Doe",
    company: "Acme Corp",
    jobTitle: "Senior React Developer",
    duration: "60 mins",
    status: "Pending",
    deadline: "2026-08-15",
    score: null,
  },
  {
    id: "ass_2",
    title: "React Fundamentals",
    candidateId: "cnd_2",
    candidate: "Jane Smith",
    company: "Acme Corp",
    jobTitle: "Product Manager",
    duration: "45 mins",
    status: "Completed",
    deadline: "2026-08-10",
    score: "90/100",
  },
]

// ─── Offers ───────────────────────────────────────────────────────────────────

export const mockOffers = [
  {
    id: "off_1",
    candidateId: "cnd_1",
    candidate: "John Doe",
    jobId: "job_1",
    role: "Senior React Developer",
    company: "Acme Corp",
    salary: "$140,000",
    equity: "0.1%",
    joiningDate: "2026-09-01",
    expires: "2026-08-20",
    status: "Pending",
    benefits: "Health, 401k, 20 PTO days",
  },
]

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications = [
  {
    id: "notif_1",
    type: "interview",
    title: "Interview Scheduled",
    message: "Your interview with Acme Corp is scheduled for Aug 12 at 10:00 AM.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "notif_2",
    type: "status",
    title: "Application Status Update",
    message: "Your application for Product Manager at Acme Corp moved to Screening.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "notif_3",
    type: "offer",
    title: "Offer Received",
    message: "You have received a job offer from Acme Corp for Senior React Developer.",
    time: "3 days ago",
    read: false,
  },
]

// ─── AI Analysis Results ──────────────────────────────────────────────────────
//
// FRONTEND PROPOSED CONTRACT — Do NOT force this on the AI service team.
// This structure reflects what the frontend expects. Coordinate with Shivam
// to align the actual API response format.

export interface AiAnalysisResult {
  matchScore: number                  // 0–100
  strengths: string[]                 // e.g. "Strong React background"
  missingSkills: string[]             // skills present in JD but absent in resume
  skillGaps: string[]                 // skills candidate has but needs to improve
  recommendations: string[]           // actionable improvement suggestions
}

export const mockAiResults: Record<string, AiAnalysisResult> = {
  "app_1": {
    matchScore: 92,
    strengths: [
      "5 years of React experience exceeds the 3-year requirement",
      "TypeScript proficiency is a strong match",
      "Next.js App Router experience is directly applicable",
    ],
    missingSkills: ["Redux Toolkit"],
    skillGaps: ["System design at scale"],
    recommendations: [
      "Complete a Redux Toolkit mini-project to close the state management gap",
      "Highlight performance optimization work on your resume",
      "Mention any CI/CD experience to strengthen the DevOps section",
    ],
  },
  "app_2": {
    matchScore: 88,
    strengths: [
      "7 years PM experience aligns with seniority expectation",
      "B2B product experience is a strong fit",
    ],
    missingSkills: ["SQL proficiency"],
    skillGaps: ["Quantitative metrics definition"],
    recommendations: [
      "Add a short SQL course (e.g., Mode Analytics) to close the data literacy gap",
      "Add specific KPI impact numbers to past role descriptions",
    ],
  },
}

// ─── Analytics ────────────────────────────────────────────────────────────────
// Already defined and typed in analyticsService.ts — not duplicated here.
// Import from that file directly when needed.
