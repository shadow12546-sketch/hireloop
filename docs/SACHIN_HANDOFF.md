# Sachin's Handoff Documentation

This document outlines Sachin's final deliverables, dependencies, and handoff procedures.

## 1. Sachin's Deliverables to Shivam
* Fully implemented Next.js frontend pages (Landing page, portals, dashboards).
* Responsive layout controls and CSS files.
* Component library wrapper objects.
* API service abstraction layer (`authService`, `jobService`, etc.).
* Documented mock data files.
* Local development environment variable template file (`.env.example`).

## 2. Required from Muskan (Backend Dependencies)
* Fully functional REST endpoints for Authentication, Job Management, Candidates, Scheduling, and Offer generation.
* Database models matching data shapes outlined in [FRONTEND_DATA_CONTRACT.md](file:///c:/Users/SACHIN%20VERMA/OneDrive/Desktop/IIT%20Bombay/docs/FRONTEND_DATA_CONTRACT.md).
* Clean staging environment for frontend integration tests.

## 3. Required from Shivam (AI Dependencies)
* AI parsing endpoint (`POST /api/ai/parse`) returning structured candidate skills and experience lists.
* Scoring calculation endpoint returning candidates' matching percentages against job profiles.
* Skill gap analysis recommendations list.

## 4. Handoff Checklist
* [ ] All tests in [FRONTEND_TEST_PLAN.md](file:///c:/Users/SACHIN%20VERMA/OneDrive/Desktop/IIT%20Bombay/docs/FRONTEND_TEST_PLAN.md) pass.
* [ ] Environment configurations match the template.
* [ ] Mock settings are documented and easily toggled.
* [ ] Frontend components run without linting errors.
