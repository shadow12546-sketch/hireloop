# PRD — Sachin's Frontend & Analytics

## Product Overview

The **AI-Powered Recruitment & Applicant Tracking System (ATS)** manages the entire recruitment lifecycle for candidates, recruiters, hiring managers, interviewers, and administrators. 

The application workflow encompasses:
```
Candidate Registration 
  -> Profile Setup 
  -> Resume Upload 
  -> Job Search & Discovery 
  -> Application Submission 
  -> AI Screening & Parsing 
  -> Stage Shortlisting 
  -> Coding Assessment 
  -> Interview Scheduling & Evaluation 
  -> Feedback Aggregation 
  -> Final Hiring Decision 
  -> Offer Letter Generation 
  -> Candidate Acceptance/Rejection
```

## Sachin's Product Scope

| Module                  | Sachin Ownership | Backend Dependency | AI Dependency    | Handoff Target |
| ----------------------- | ---------------- | ------------------ | ---------------- | -------------- |
| Landing Page            | UI / UX Layout   | No                 | No               | Shivam         |
| Authentication UI       | UI / Form State  | Muskan             | No               | Shivam         |
| Candidate Portal        | Full UI / UX     | Muskan             | Shivam           | Shivam         |
| Recruiter Dashboard     | Full UI / UX     | Muskan             | Optional AI data | Shivam         |
| Job UI                  | Full UI          | Muskan             | No               | Shivam         |
| Candidate Management UI | Full UI          | Muskan             | AI results       | Shivam         |
| Kanban Board            | Full UI / Drag   | Muskan             | No               | Shivam         |
| Resume UI               | Upload & Render  | Muskan             | Shivam           | Shivam         |
| AI Result UI            | Visualization    | Shivam             | Shivam           | Shivam         |
| Interview UI            | Full UI          | Muskan             | No               | Shivam         |
| Assessment UI           | Full UI          | Muskan/Shivam      | Possible         | Shivam         |
| Offer UI                | Full UI          | Muskan             | No               | Shivam         |
| Notifications UI        | Full UI          | Muskan             | No               | Shivam         |
| Analytics               | Full UI & Charts | Muskan             | No               | Shivam         |
| Admin UI                | Full UI          | Muskan             | No               | Shivam         |

## MVP Priority Focus
* **P0 (Must Have):** Core recruitment flow including Landing Page, Authentication UI, Candidate Dashboard, Recruiter Dashboard, Jobs, Kanban Board, Resume Upload UI, Interview Scheduling UI, Offer Management, and Basic Analytics.
* **P1 (Should Have):** Advanced Analytics, Global Search, Admin UI, Notification Management.
* **P2 (Nice to Have):** AI cover letter generator, WebSockets updates, advanced calendar sync.
