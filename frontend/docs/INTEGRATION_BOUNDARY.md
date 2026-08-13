# Integration Boundary

This document delineates the responsibilities of Sachin, Shivam, and Muskan.

## Responsibility Map

```
SACHIN (Frontend + UI Analytics)
   │
   ├─ Delivers: Reusable UI Pages, Style Themes, API Client Layer
   ▼
SHIVAM (Integration, AI Orchestration, & Deployment)
   ▲
   ├─ Delivers: Endpoints, AI Scores, End-to-End Testing, Final Build
   │
MUSKAN (Backend & Database APIs)
```

## Key Boundaries

### 1. Sachin's Domain
* Directing user layouts, form inputs, validation triggers, design variables, dashboard animations, and charts.
* Mocking API integrations to ensure independent testing.
* Sachin **does not** configure production deployment, database structures, or AI model scripts.

### 2. Muskan's Domain
* Building database schemas, server routes, permissions validation, email notifications delivery, and offers generation logic.

### 3. Shivam's Domain
* AI models configuration, parsing, candidate scoring, and integrating Sachin's frontend client with Muskan's API.
* Production deployments, environments, and E2E system checks.
