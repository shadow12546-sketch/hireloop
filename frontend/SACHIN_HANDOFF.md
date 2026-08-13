# Frontend Handoff Document

**Prepared By:** Sachin Verma (Frontend & Analytics)  
**Handed Off To:** Shivam (AI, Final Integration, & Deployment)  

This document serves as the official handoff for the DevFusion ATS platform's frontend tier. The frontend is fully completed, polished, responsive, and mocked. 

---

## 1. Completed Features

The following frontend modules are fully designed, implemented, and styled with responsive layouts and dark mode support:

- **Public Views:** Landing page with hero, features, testimonials, and dynamic gradients.
- **Authentication:** Login, Register, and Forgot Password UIs.
- **Candidate Portal:** Dashboard, Profile, Job Discovery, Application Tracking, and AI Analysis UI.
- **Recruiter UI:** Overview Dashboard, Job Postings, Candidate Database, Kanban Pipeline, Analytics, Interviews, and Offers.
- **Hiring Manager UI:** Candidate Review Dashboard and final decision interface.
- **Admin UI:** System Administration dashboard with Audit Logs and KPI tracking.
- **Interviewer UI:** Dedicated route for viewing upcoming interviews and submitting feedback.
- **Core Architecture:** Responsive Drawer/Sidebar navigation, API Service layer, global Error/Not-Found boundaries, and Skeleton loading states.

## 2. Routes

**Public / Auth:**
- `/` (Landing Page)
- `/login`, `/register`, `/forgot-password`

**Candidate (`/candidate/*`):**
- `/candidate` (Dashboard)
- `/candidate/jobs`, `/candidate/applications`, `/candidate/applications/[id]`
- `/candidate/profile`, `/candidate/resume`
- `/candidate/interviews`, `/candidate/assessments`, `/candidate/offers`, `/candidate/notifications`

**Recruiter (`/recruiter/*`):**
- `/recruiter` (Dashboard)
- `/recruiter/analytics`, `/recruiter/kanban`
- `/recruiter/jobs`, `/recruiter/jobs/create`, `/recruiter/jobs/[id]`
- `/recruiter/candidates`, `/recruiter/candidates/[id]`
- `/recruiter/interviews`, `/recruiter/assessments`, `/recruiter/offers`, `/recruiter/notifications`

**Manager, Admin, Interviewer:**
- `/manager`, `/manager/candidates/[id]`
- `/admin`, `/admin/users`, `/admin/roles`, `/admin/companies`, `/admin/audit`
- `/interviewer`, `/interviewer/[id]`

## 3. Important Components

Key reusable components built for the application:
- **Layout:** `<Sidebar>`, `<TopNav>`, `<MobileNav>` (Handles responsive drawer logic).
- **Domain Specific:** `<HiringFunnel>` (SVG charts), `<AIAnalysisCard>` (AI result presentation), `<ApplicationTimeline>`, `<JobCard>`.
- **UI Primitives:** `<Button>`, `<Card>`, `<Badge>`, `<Input>` (Extended from Base UI, styled with Tailwind).

## 4. Frontend API Services

The API service layer (`src/services/*.ts`) handles all data fetching and currently returns mock data.
- `aiService.ts`
- `analyticsService.ts`
- `applicationService.ts`
- `assessmentService.ts`
- `authService.ts`
- `candidateService.ts`
- `interviewService.ts`
- `jobService.ts`
- `notificationService.ts`
- `offerService.ts`

## 5. API Dependencies

The frontend expects endpoints to be provided by the backend team. The dependencies are split as follows:

### Muskan / Backend
- **Auth:** Login, Register, JWT validation.
- **Core CRUD:** Jobs, Applications, Candidates, Companies, Users, Roles.
- **Workflow:** Kanban status updates, Interview scheduling, Offer generation.
- **Analytics:** Aggregation endpoints for KPIs and funnel metrics.

### Shivam / AI
- **Resume Parsing:** Extracted skills, experience, and education.
- **Job Matching AI:** Match score generation against a specific job description.
- **Gap Analysis:** Identification of missing skills and strengths.

## 6. Proposed AI Contract

For the AI matching feature (used in `AIAnalysisCard`), the frontend expects the following JSON response structure from the AI service endpoint (e.g., `POST /ai/analyze/{applicationId}`):

```json
{
  "matchScore": 85,
  "strengths": ["Strong React experience", "Previous startup experience"],
  "missingSkills": ["Python", "AWS"],
  "skillGaps": ["System Design Leadership"],
  "recommendation": "Strong technical fit. Probe deeper on cloud architecture experience during the interview."
}
```

## 7. Environment Variables

The frontend expects the following environment variable NAMES. *(Note: Actual secret values must be set by Shivam during deployment)*.

- `NEXT_PUBLIC_API_URL` (Base URL for Muskan's Backend)
- `NEXT_PUBLIC_AI_SERVICE_URL` (Base URL for Shivam's AI Service)

## 8. Mock Data Integration

Currently, the application runs entirely on mock data to allow frontend development without blocking. 

**To disable mock data and connect real APIs:**
1. Open `src/lib/apiClient.ts`
2. Change the constant `export const IS_MOCK = true;` to `false`.
3. Ensure `NEXT_PUBLIC_API_URL` is correctly configured in your `.env`.
4. Ensure the backend returns the data shapes currently simulated in `src/lib/mockData.ts`.

## 9. Known Issues

- Secondary pages (like Candidate Profile Editor, generic Interviewer Feedback forms) are UI shells that need proper form validation (e.g., Zod) implemented when real backend mutations are wired up.
- The `aiAnalysis` object relies on the backend returning it nested inside the application object or fetched on demand. The contract might need slight adjustments depending on how Shivam structures the AI latency handling (e.g., polling vs WebSockets).

## 10. Integration Instructions

The flow of integration to production follows this path:

```text
Sachin Frontend
      ↓
Muskan Backend
      +
Shivam AI
      ↓
Shivam Final Integration
      ↓
Testing
      ↓
Deployment
```

## FINAL BOUNDARY

> **Sachin has completed frontend + analytics responsibilities. Final integration and deployment are owned by Shivam.**
