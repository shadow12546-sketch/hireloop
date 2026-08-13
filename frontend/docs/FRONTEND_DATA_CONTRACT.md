# Frontend Data Contract Models

This document outlines the TypeScript data interfaces and types used throughout Sachin's frontend codebase.

## 1. Candidate Interface
```typescript
interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  skills: string[];
  resumeUrl?: string;
  currentStage: "Applied" | "Screening" | "Shortlisted" | "Interview" | "Offer" | "Hired" | "Rejected";
  matchScore?: number;
}
```

## 2. Job Interface
```typescript
interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  experienceLevel: "Junior" | "Mid" | "Senior" | "Lead";
  skillsRequired: string[];
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  workMode: "Remote" | "On-site" | "Hybrid";
  deadline: string;
  description: string; // Markdown supported
  status: "Draft" | "Active" | "Closed";
  createdAt: string;
}
```

## 3. Application Interface
```typescript
interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  status: Candidate["currentStage"];
  appliedDate: string;
  aiScore?: number;
}
```

## 4. Analytics KPIMetrics Interface
```typescript
interface KPIMetrics {
  totalJobs: number;
  activeCandidates: number;
  interviewsToday: number;
  pendingReviews: number;
  offerAcceptanceRate: number; // percentage
}
```
