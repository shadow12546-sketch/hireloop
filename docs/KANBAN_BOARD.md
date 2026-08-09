# Kanban Board Specification

The Kanban Board maps the recruitment pipeline stages visually.

## 1. Column Stages
* **Applied** — Incoming submissions.
* **Screening** — Initial validation and CV check.
* **Shortlisted** — Candidates approved for testing.
* **Interview** — Active scheduling and interview evaluation stages.
* **Offer** — Offer letters generation and review stages.
* **Hired** — Offer accepted and onboarding setup.
* **Rejected** — Dropped candidates at any stage.

## 2. Interactive Features & State Machine
* **Drag-and-Drop:** Drag card to transfer candidates between stages.
* **Optimistic UI Update:** Immediately move card on screen; show saving overlay indicator.
* **Failure & Rollback:** If the backend API request fails, move the card back to its source column, and trigger an error toast.
* **Trigger Actions on Drag:**
  * Dropping onto "Interview" launches scheduling dialog modal.
  * Dropping onto "Offer" displays offer creation modal sheet.
  * Dropping onto "Rejected" shows email notification template selector.
* **API Handshake:** `PATCH /api/applications/[id]/stage` with payload: `{ stage: string }`.
