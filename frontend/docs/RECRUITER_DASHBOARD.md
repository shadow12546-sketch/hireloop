# Recruiter Dashboard PRD

The Recruiter Dashboard provides analytics, pipeline views, and candidate metrics to simplify hiring workflows.

## 1. KPI Cards Specs

| Widget | Purpose | Format | Backend API Endpoint |
| --- | --- | --- | --- |
| **Total Active Jobs** | Shows count of currently hiring roles | Number | `GET /api/analytics/kpis` |
| **Active Candidates** | Count of candidates in active stages | Number | `GET /api/analytics/kpis` |
| **Today's Interviews**| Scheduled meetings for current date | Number | `GET /api/analytics/kpis` |
| **Pending Reviews** | Resumes needing recruiter validation | Number | `GET /api/analytics/kpis` |
| **Offer Acceptance Rate** | Ratio of accepted offers vs issued | Percentage (%) | `GET /api/analytics/kpis` |

## 2. Charts & Data Visualization

### A. Hiring Funnel
* **Type:** Horizontal funnel chart (or stacked bar chart).
* **Stages Visualized:** Applied → Screening → Shortlisted → Interview → Offer → Hired.
* **Responsive Behavior:** Auto-scaling widths, touch-enabled tooltips showing candidate counts on mobile viewports.

### B. Monthly Hiring Trend
* **Type:** Smooth Area Chart or Line Chart.
* **Axes:** X-Axis: Month, Y-Axis: Successful hires count.
* **Theme Adaptability:** Swaps gradient colors between Dark Mode (deep purple/violet accents) and Light Mode (vibrant blue accents).

## 3. Recent Activity Feed
* **Type:** Interactive feed timeline.
* **Details:** Chronological events (e.g., "John Doe uploaded resume", "Jane Smith passed Java Assessment").
* **States:** Infinite scroll trigger, loading skeleton indicators, dynamic status badge highlights.
