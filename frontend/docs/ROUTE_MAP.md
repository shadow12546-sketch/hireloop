# Route Map

This route map describes the routing endpoints for the React / Next.js app.

## Public / Guest Routes
* `/` — Landing page
* `/login` — Account authentication portal
* `/register` — Account registration interface
* `/forgot-password` — Password recovery initialization

## Candidate Portal Routes (`/candidate`)
* `/candidate` — Dashboard & Action items
* `/candidate/profile` — Profile edit, personal information, skills input
* `/candidate/jobs` — Job search dashboard & filters
* `/candidate/jobs/[id]` — Detailed job view and application button
* `/candidate/applications` — History of applications and status tracking
* `/candidate/interviews` — Scheduled interview list and video links
* `/candidate/assessments` — Active code editor and assessment tasks
* `/candidate/offers` — Pending and accepted job offer letters
* `/candidate/notifications` — Notification inbox

## Recruiter Dashboard Routes (`/recruiter`)
* `/recruiter` — Analytics overview and KPI charts
* `/recruiter/jobs` — Created jobs listing
* `/recruiter/jobs/create` — Job creation form wizard
* `/recruiter/jobs/[id]` — Job details page
* `/recruiter/candidates` — Candidate index search and parsing metrics
* `/recruiter/applications` — Kanban view of applicant pipelines
* `/recruiter/interviews` — Recruiter scheduling layout
* `/recruiter/assessments` — Assessment template creation and assignment
* `/recruiter/offers` — Offer letter templates & draft generator
* `/recruiter/analytics` — Detailed recruiting metrics reporting

## Interviewer Routes (`/interviewer`)
* `/interviewer/interviews` — List of interviews assigned to the interviewer
* `/interviewer/interviews/[id]` — Specific interview dashboard, candidate resume, and feedback form

## Hiring Manager Routes (`/hiring-manager`)
* `/hiring-manager/candidates` — Candidate assessment sheets and match scores
* `/hiring-manager/decisions` — Panel for candidate hire/no-hire decisions
* `/hiring-manager/analytics` — Departmental performance tracking

## System Admin Routes (`/admin`)
* `/admin/users` — User management (create, delete, edit roles)
* `/admin/roles` — Role permissions customization UI
* `/admin/companies` — Company profiles and workspaces
* `/admin/jobs` — Platform-wide job moderator dashboard
* `/admin/settings` — Global configuration parameters
* `/admin/audit-logs` — Administrative actions logging view
