# Backend Handover & API Contract

This document provides the necessary architecture guidelines, state models, and API contracts for the backend team to integrate with the frontend UI.

## Overview
The frontend is built with Next.js (App Router), React, and Tailwind CSS. All data fetching is abstracted into a Service Layer (`src/services/*`), which uses `apiClient.ts` as the central HTTP client. 

To connect the real backend, the backend team only needs to update `src/lib/apiClient.ts` by setting `IS_MOCK = false` and configuring the `API_BASE_URL`.

## State Models

### 1. Application Status (Strict Sequence)
Applications follow a strict state machine. The frontend UI heavily relies on these exact string values:
- `Applied`
- `Screening`
- `Shortlisted`
- `Assessment`
- `Interview`
- `Offer`
- `Hired`
- `Rejected` (Terminal state from any prior stage)

### 2. Assessment Status
- `Assigned` (Candidate needs to take it)
- `Started` (Candidate has begun)
- `Submitted` (Candidate finished, pending AI scoring)
- `Completed` (AI scored)
- `Expired` (Deadline passed)

### 3. Interview Status
- `Scheduled` / `Upcoming`
- `Completed`
- `Cancelled`
- `Rescheduled`

### 4. Offer Status
- `Draft` (Employer side only)
- `Sent` (Pending candidate action)
- `Viewed` (Candidate opened it)
- `Accepted`
- `Rejected`
- `Expired`

## API Contracts

All endpoints should return JSON. Successful responses should ideally follow a standard format, e.g., `{ "data": ... }`, though the current `apiClient` expects direct object/array returns for GET requests.

### Authentication
- `POST /auth/login`: `{ email, password, role }` -> Returns `{ token, user }`
- `POST /auth/register`: `{ email, password, role, ...details }` -> Returns `{ token, user }`
- `GET /auth/me`: Returns `{ user }`

### Candidate Endpoints
- `GET /candidate/jobs`: Discoverable jobs.
- `GET /candidate/applications`: Candidate's application history.
- `GET /candidate/assessments`: Candidate's assigned assessments.
- `GET /candidate/interviews`: Candidate's interviews.
- `GET /candidate/offers`: Candidate's offers.
- `GET /candidate/notifications`: Candidate's notifications.

### Employer Endpoints
- `GET /employer/jobs`: Employer's posted jobs.
- `POST /employer/jobs`: Create a new job post.
- `GET /employer/candidates`: Employer's candidate database.
- `GET /employer/applications`: Incoming applications for employer's jobs.
- `PATCH /employer/applications/:id/status`: Update application status (Kanban drag-and-drop).
- `GET /employer/interviews`: Employer's scheduled interviews.
- `GET /employer/offers`: Employer's generated offers.
- `GET /employer/analytics`: Aggregated analytics data (funnel, KPIs, etc.).

## Authentication & Authorization
The frontend uses JWT-based authentication. The `apiClient` automatically attaches the `Authorization: Bearer <token>` header to all requests. The backend is responsible for verifying this token and ensuring role-based access control (RBAC).

**Important:** The frontend NEVER decides Employer authenticity, Candidate eligibility, or AI scores. The backend MUST enforce these rules.

## Error Handling
The backend should return standard HTTP status codes:
- `400 Bad Request` for validation errors (return field-level errors if possible).
- `401 Unauthorized` for missing/invalid tokens.
- `403 Forbidden` for unauthorized role access.
- `404 Not Found` for resources that don't exist.
- `500 Internal Server Error` for backend crashes.

The frontend `apiClient` throws errors on non-2xx responses, which the UI catches to display error states.
