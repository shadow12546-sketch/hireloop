# Frontend API Service Layer Contract

This document specifies the abstract service classes or utility hooks Sachin's frontend will use to fetch data, hiding mock data swaps or backend endpoint integrations from the visual components.

## 1. Authentication Service (`authService`)
* **`login(credentials)`**
  * *Endpoint:* `POST /api/auth/login`
  * *Method:* POST
  * *Response:* `{ token: string, user: UserObject }`
* **`register(userData)`**
  * *Endpoint:* `POST /api/auth/register`
  * *Method:* POST
  * *Response:* `{ success: boolean, userId: string }`

## 2. Jobs Service (`jobService`)
* **`getAll(filters)`**
  * *Endpoint:* `GET /api/jobs`
  * *Method:* GET
  * *Response:* `{ jobs: Job[] }`
* **`getById(id)`**
  * *Endpoint:* `GET /api/jobs/[id]`
  * *Method:* GET
  * *Response:* `Job`

## 3. Resume Service (`resumeService`)
* **`upload(file, candidateId)`**
  * *Endpoint:* `POST /api/resume/upload`
  * *Method:* POST
  * *Response:* `{ resumeId: string, url: string }`
* **`parse(resumeId)`**
  * *Endpoint:* `POST /api/resume/[resumeId]/parse`
  * *Method:* POST
  * *Response:* `{ parsedResume: ParsedResumeObject }` (Consumes Shivam's parsing service).

## 4. Analytics Service (`analyticsService`)
* **`getKPIMetrics()`**
  * *Endpoint:* `GET /api/analytics/kpis`
  * *Method:* GET
  * *Response:* `{ totalJobs: number, activeCandidates: number, interviewsToday: number, pendingReviews: number, offerAcceptanceRate: number }`
* **`getFunnelData()`**
  * *Endpoint:* `GET /api/analytics/funnel`
  * *Method:* GET
  * *Response:* `{ stages: { stage: string, count: number }[] }`
