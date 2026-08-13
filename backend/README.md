# HireLoop Backend

A standalone backend for **HireLoop**, an AI-powered recruitment / Applicant Tracking System (ATS), built for a hackathon.

> ⚠️ **This is a hackathon project, not production-ready.** See [Known Limitations](#known-limitations) at the bottom.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [MongoDB Setup](#mongodb-setup)
7. [Environment Variables](#environment-variables)
8. [Running the Server](#running-the-server)
9. [Running Tests](#running-tests)
10. [Seeding Demo Data](#seeding-demo-data)
11. [Authentication Flow](#authentication-flow)
12. [Roles](#roles)
13. [API Overview](#api-overview)
14. [Resume Upload & GridFS Architecture](#resume-upload--gridfs-architecture)
15. [Application Workflow](#application-workflow)
16. [Automatic Assessment Assignment](#automatic-assessment-assignment)
17. [AI Integration (for Shivam)](#ai-integration-for-shivam)
18. [Frontend Integration (for Sachin)](#frontend-integration-for-sachin)
19. [Email Setup](#email-setup)
20. [Troubleshooting](#troubleshooting)
21. [Known Limitations](#known-limitations)
22. [Assumptions to Confirm With Your Team](#assumptions-to-confirm-with-your-team)

---

## Project Overview

HireLoop lets **employers** post jobs and manage candidates through a structured hiring pipeline (screening -> shortlisting -> assessment -> AI interview -> final decision -> offer), and lets **candidates** apply to jobs, upload resumes, take assessments, and go through an AI-driven interview.

There are only **two roles**: `candidate` and `employer`. There is no admin role.

## Tech Stack

- **Node.js** (>=18) + **Express.js**
- **MongoDB** + **Mongoose**
- **MongoDB GridFS** for resume file storage
- **JWT** (access + refresh tokens)
- **Google OAuth** (ID-token verification via `google-auth-library`)
- **bcryptjs** for password hashing
- **Multer** for handling file uploads
- **Nodemailer** for emails
- **Zod** for request validation
- **Jest + Supertest + mongodb-memory-server** for tests
- Plain JavaScript (no TypeScript)

## Project Structure

```
hireloop-backend/
├── src/
│   ├── config/          # env, db, gridfs, mailer, google oauth
│   ├── constants/       # roles, statuses, enums (single source of truth)
│   ├── controllers/     # request handlers (thin - delegate to services)
│   ├── middleware/      # auth, authorize, validate, error handler, multer
│   ├── models/          # 13 Mongoose models
│   ├── routes/          # Express routers, one per resource
│   ├── services/        # business logic (tokens, email, workflow engine, AI persistence, resumes)
│   ├── utils/           # ApiError, ApiResponse, asyncHandler, jwt, pagination, seed script
│   ├── validators/      # Zod schemas per resource
│   ├── app.js           # Express app setup (middleware + routes)
│   └── server.js        # entry point (connects DB, starts server)
├── tests/                # Jest test suites + helpers
├── postman/              # Postman collection
├── .env.example
├── package.json
└── README.md (this file)
```

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** running locally, OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## Installation

```bash
# 1. Extract the ZIP, then cd into it
cd hireloop-backend

# 2. Install dependencies
npm install

# 3. Copy environment variables template
cp .env.example .env

# 4. Edit .env and fill in at least MONGODB_URI (see next section)
```

## MongoDB Setup

**Option A — Local MongoDB**

Install MongoDB Community Server, then start it (varies by OS, e.g. `mongod` or `brew services start mongodb-community`). Use:

```
MONGODB_URI=mongodb://127.0.0.1:27017/hireloop
```

**Option B — MongoDB Atlas (cloud, free tier)**

1. Create a free cluster at mongodb.com/atlas
2. Create a database user + allow your IP (or `0.0.0.0/0` for hackathon convenience)
3. Copy the connection string into `.env`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hireloop
```

No manual schema setup needed — Mongoose creates collections/indexes automatically on first use.

## Environment Variables

See `.env.example` for the full list with comments. Minimum required to boot the server:

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Connection string |
| `JWT_ACCESS_SECRET` | Yes | Any long random string |
| `JWT_REFRESH_SECRET` | Yes | Must differ from access secret |
| `PORT` | No | Defaults to 5000 |
| `FRONTEND_URL` | No | Used for CORS, defaults to `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Only if using Google Sign-In | |
| `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASSWORD` | No | If blank, emails are logged to console instead of sent (safe default) |

**Never commit your real `.env` file.**

## Running the Server

```bash
npm run dev     # nodemon, auto-restarts on file changes
# or
npm start       # plain node
```

Server starts on `http://localhost:5000` (or your `PORT`). Health check:

```bash
curl http://localhost:5000/api/health
```

## Running Tests

Tests use an **in-memory MongoDB** (via `mongodb-memory-server`), so they never touch your real database.

```bash
npm test
```

Covers: registration, login, role authorization (candidate vs employer), employer job creation, candidate job access, application creation, duplicate application prevention, deadline validation, resume upload validation (file type + missing file), candidate-only application enforcement, employer-only job creation enforcement, application status transition validation, and automatic assessment assignment.

## Seeding Demo Data

```bash
npm run seed
```

Creates one demo candidate, one demo employer + company, one open job, and one assessment template. Credentials are printed to the console (both accounts use password `Password123!` — clearly a fake demo password, not a real secret).

## Authentication Flow

1. **Register**: `POST /api/auth/register` with `{ name, email, password, role }` where `role` is `"candidate"` or `"employer"` only. Returns `accessToken` + `refreshToken`.
2. **Login**: `POST /api/auth/login` with `{ email, password }`.
3. **Google Sign-In**: Frontend uses Google Identity Services to get an ID token, then calls `POST /api/auth/google` with `{ idToken, role }` (role only needed the first time). See assumptions section below.
4. Use the `accessToken` in the `Authorization: Bearer <token>` header for all protected routes. It expires in 15 minutes by default.
5. When it expires, call `POST /api/auth/refresh` with `{ refreshToken }` to get a new pair.
6. `POST /api/auth/logout` invalidates all outstanding refresh tokens for that user (bumps a version counter server-side).

Passwords are hashed with **bcryptjs** (10 salt rounds) and never stored or returned in plain text. Google-only accounts have no password hash.

## Roles

Only two roles exist: **`candidate`** and **`employer`**. There is no admin role anywhere in this system — do not add one without carefully updating every authorization check.

## API Overview

Base path: `/api`. All responses follow this shape:

**Success:**
```json
{ "success": true, "message": "...", "data": { } }
```

**Error:**
```json
{ "success": false, "message": "...", "errors": [] }
```

| Resource | Base Route | Auth Required |
|---|---|---|
| Auth | `/api/auth` | Mixed (see route file) |
| Candidate Profile | `/api/candidates` | candidate (self) / employer (view others) |
| Company | `/api/companies` | employer |
| Jobs | `/api/jobs` | either role to view; employer to create/update/delete |
| Resumes | `/api/resumes` | candidate (upload/delete); either role (view, with ownership rules) |
| Applications | `/api/applications` | candidate (apply, view own); employer (manage) |
| Assessments | `/api/assessments` | employer (templates); candidate (take) |
| AI Integration | `/api/ai` | authenticated (see AI section) |
| Offers | `/api/offers` | employer (create); either (view, with ownership) |
| Notifications | `/api/notifications` | either role (self only) |
| Analytics | `/api/analytics` | employer |

Full endpoint list is in the Postman collection (`postman/HireLoop.postman_collection.json`) — import it into Postman and set the `baseUrl` variable.

### Key endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/jobs?search=&location=&workMode=&employmentType=&skills=&page=&limit=
POST   /api/jobs                (employer)
PATCH  /api/jobs/:id             (employer, owner only)
DELETE /api/jobs/:id             (employer, owner only)

POST   /api/resumes/upload       (candidate, multipart "resume" field)
GET    /api/resumes/:id          (streams the file)
DELETE /api/resumes/:id

POST   /api/applications                     (candidate)
GET    /api/applications/mine                (candidate)
GET    /api/applications/job/:jobId          (employer, owner only)
PATCH  /api/applications/:id/advance         (employer) - move to next status
POST   /api/applications/:id/decision        (employer) - final OFFER/REJECTED

POST   /api/assessments/templates            (employer)
GET    /api/assessments/attempts/:id
PATCH  /api/assessments/attempts/:id/start   (candidate)
POST   /api/assessments/attempts/:id/submit  (candidate)

POST   /api/ai/resume/parse
POST   /api/ai/resume/match
POST   /api/ai/interview/session
GET    /api/ai/interview/session/:applicationId

POST   /api/offers                           (employer)
GET    /api/offers/:id

GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

GET    /api/analytics/overview               (employer)
GET    /api/analytics/jobs/:jobId            (employer)
```

## Resume Upload & GridFS Architecture

- **Multer** (memory storage) receives the multipart upload and validates file type (`.pdf`, `.doc`, `.docx`) and size (default max 5MB, configurable via `MAX_RESUME_SIZE_MB`).
- The file buffer is streamed into a **MongoDB GridFS bucket** named `resumes` (see `src/config/gridfs.js`).
- A `Resume` document stores only **metadata**: `candidate`, `fileId` (GridFS file ID), `originalFilename`, `mimeType`, `fileSize`, `uploadedAt`, `isActive`.
- `GET /api/resumes/:id` streams the actual file bytes back to the client with the correct `Content-Type`.
- Uploading a new resume automatically deactivates the candidate's previous resume(s) (soft-delete, kept for history) and updates `CandidateProfile.activeResume`.
- No external storage service (S3, Firebase, Cloudinary) is used — everything lives in your MongoDB instance.

## Application Workflow

Statuses are centralized in `src/constants/applicationConstants.js` — **never use raw strings** elsewhere in the code.

```
APPLIED -> SCREENING -> SHORTLISTED -> ASSESSMENT -> AI_INTERVIEW -> EMPLOYER_FINAL_DECISION -> OFFER
                                                                                                -> REJECTED
```

- `REJECTED` is reachable from any non-terminal status.
- There is **no human interview** — `AI_INTERVIEW` is fully AI-driven (see AI Integration below).
- The AI **never** sets `OFFER` or `REJECTED`. Only the employer can, via `POST /api/applications/:id/decision`, and only when the application is in `EMPLOYER_FINAL_DECISION`.
- `PATCH /api/applications/:id/advance` handles all other forward transitions and validates each move against the legal-transition map (`isValidTransition()`).
- Every transition is recorded in `application.statusHistory` and in the `ActivityLog` collection.
- Duplicate applications are blocked two ways: an application-level check before insert, **and** a unique compound MongoDB index on `{ candidate, job }` (belt and suspenders).

## Automatic Assessment Assignment

When an application transitions into `ASSESSMENT` status, the backend **automatically** picks the best-matching `Assessment` template — no AI required for this step:

1. Every active `Assessment` template has a `tags` array (e.g. `["javascript", "react"]`).
2. The system compares each template's tags against the job's `skills` array and counts overlaps.
3. The highest-overlap template is selected. If no template overlaps at all, the most recently created active template is used as a fallback (better than assigning nothing for a hackathon demo).
4. An `AssessmentAttempt` is created linking the template, the application, and the candidate.

See `src/services/applicationWorkflowService.js` -> `findBestMatchingAssessment()` / `autoAssignAssessment()`.

## AI Integration (for Shivam)

**The backend does NOT implement any LLM/AI logic.** It only provides authenticated, validated persistence endpoints. Full contract:

### 1. `POST /api/ai/resume/parse`
- **Auth:** candidate (resume owner) or employer, Bearer token required.
- **Two-step contract:**
  - Call with `{ "resumeId": "..." }` -> returns `{ fileDownloadUrl, originalFilename, mimeType }`. Fetch the file from `fileDownloadUrl` (`GET /api/resumes/:id`) and process it externally.
  - Call again with `{ "resumeId": "...", "result": { atsScore, extractedSkills, extractedEducation, extractedExperience, keywords, candidateInfo } }` -> persists a `ResumeAnalysis` document (`type: "parse"`).
- **DB affected:** `ResumeAnalysis` (upserted by `resume` + `type`).

### 2. `POST /api/ai/resume/match`
- **Auth:** candidate (resume owner) or employer who owns the job.
- Same two-step pattern, scoped to a specific job:
  - Step 1: `{ resumeId, jobId }` -> returns file + job detail URLs.
  - Step 2: `{ resumeId, jobId, applicationId?, result: { matchScore, strengths, weaknesses, missingSkills, recommendation, keywords } }` -> persists `ResumeAnalysis` (`type: "match"`).
- **DB affected:** `ResumeAnalysis` (upserted by `resume` + `job` + `type`).

### 3. `POST /api/ai/interview/session`
- **Auth:** candidate who owns the application.
- Supports **partial/incremental saves** — call multiple times as an interview progresses.
- Body: `{ applicationId, transcript?: [{speaker, message}], summary?, score?, strengths?, weaknesses?, recommendation?, status? }` where `status` is `NOT_STARTED | IN_PROGRESS | COMPLETED`.
- New transcript entries are **appended**, not overwritten.
- **DB affected:** `InterviewSession` (upserted by `application`). When `status: "COMPLETED"`, the parent `Application.interviewSession` is also set.
- `GET /api/ai/interview/session/:applicationId` retrieves current state (candidate resuming, or employer reviewing).

**Errors:** All endpoints return the standard `{ success: false, message, errors }` shape with `404` if the resume/job/application doesn't exist, `403` if the caller lacks permission. **AI failures never corrupt the application workflow** — analysis/session documents are independent of `Application.status`, so a failed or incomplete AI call simply leaves stale/partial data rather than blocking the pipeline.

**No specific AI provider is assumed.** Plug in OpenAI, Anthropic, a local model, or anything else — the backend only cares about the JSON shape above.

## Frontend Integration (for Sachin)

- All routes are under `/api`, JSON in/out (except file upload which is `multipart/form-data` and file download which streams raw bytes).
- Auth: send `Authorization: Bearer <accessToken>` on every protected request.
- Consistent response envelope (see API Overview above) — check `success` before reading `data`.
- Validation errors return `400` with `errors: [{ field, message }, ...]`.
- Pagination endpoints return `meta: { page, limit, totalCount, totalPages, hasNextPage, hasPrevPage }` alongside `data`.
- See the Postman collection for exact request/response shapes per endpoint, and `src/validators/*.js` for the precise field-level validation rules the frontend should mirror client-side.
- Role requirements per endpoint are documented as comments directly above each route in `src/routes/*.js`.

## Email Setup

Uses **Nodemailer**. If `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASSWORD` are left blank in `.env`, the backend automatically falls back to logging emails to the console instead of sending them — so the app works out of the box for local development without any email setup.

To send real emails (e.g. via Gmail):
1. Enable 2FA on the Gmail account, then generate an **App Password**.
2. Set:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=<16-character app password>
   ```
Email failures are always caught and logged — they **never** crash a request or block an application status update.

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongooseServerSelectionError` | MongoDB isn't running or `MONGODB_URI` is wrong. Check the connection string and that MongoDB is started. |
| `403` on every request | Missing/expired `Authorization: Bearer <token>` header, or wrong role for that endpoint. |
| File upload returns 400 "Invalid file type" | Only `.pdf`, `.doc`, `.docx` are accepted. |
| Emails not arriving | Check `.env` email vars are set; otherwise emails are only logged to console (this is expected default behavior). |
| `npm test` hangs or fails to start | Make sure no other process is holding onto ports; `mongodb-memory-server` downloads a MongoDB binary on first run — needs internet access once. |
| Google Sign-In fails | Ensure `GOOGLE_CLIENT_ID` matches the frontend's OAuth client, and the frontend is sending an **ID token**, not an access token. |
| `Cannot create GridFS bucket before MongoDB connection` | This means resume routes were hit before `connectDB()` resolved — shouldn't happen in normal `npm start` flow; restart the server. |

## Known Limitations

This is a hackathon backend. Notable simplifications:

- No refresh-token-per-device tracking — logout invalidates **all** sessions for a user at once.
- Resume file access control is coarse: any authenticated employer can fetch any resume by ID (not scoped to "employers who received an application with that resume"). Fine for a hackathon demo; tighten before any real use.
- No file virus scanning on uploads.
- Assessment coding-question grading is not automated (manual review only).
- No soft-delete/undo for jobs (`DELETE /api/jobs/:id` is a hard delete).
- No pagination caps beyond a max `limit` of 50.
- No WebSocket/real-time notifications — notifications are poll-based (`GET /api/notifications`).
- Rate limiting is basic (in-memory, resets on restart) — fine for a single-instance hackathon deploy, not for horizontal scaling.

## Assumptions to Confirm With Your Team

These were necessary to keep moving without frontend/AI-service access, and are isolated so they're easy to change:

1. **Google OAuth flow**: implemented as ID-token verification (`POST /api/auth/google` with `{ idToken, role }`), assuming the frontend uses Google Identity Services (GIS) client-side. If Sachin's frontend instead needs a server-side redirect flow using `GOOGLE_CALLBACK_URL`, that requires a small rework in `src/config/googleOAuth.js` and `authController.googleAuth`.
2. **One company per employer** (`Company.owner` is unique). If your team wants employers to manage multiple companies, remove that unique constraint and adjust `companyController`/`jobController` to accept a `companyId` instead of inferring it from `req.user.id`.
3. **Resume download access**: any authenticated employer can view any resume by ID (see Known Limitations above) — tighten to "only employers with a matching application" if needed before demo day, if time allows.
4. **Assessment auto-assignment fallback**: if no template's tags overlap with a job's skills, the most recently created template is assigned rather than leaving the candidate without one. Confirm this is the desired behavior.
5. **Job default visibility**: `GET /api/jobs` without an explicit `status` filter shows only `OPEN` jobs. Employers viewing their own postings should use `GET /api/jobs/mine/list` instead, which shows all statuses.
