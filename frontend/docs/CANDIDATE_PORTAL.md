# Candidate Portal PRD

The Candidate Portal provides job seekers with a single dashboard to manage their profiles, review application statuses, complete assessments, and coordinate interviews.

## 1. Candidate Screens & Requirements

### A. Dashboard
* **Purpose:** High-level summary of active candidacies, next tasks, and profile overview.
* **UI Components:** Welcome banner, Profile Completion Progress Bar, Upcoming Tasks Widget, Match Score Quick Look, Notification Stream.
* **Data Needed:** Candidate summary object, array of active application stages, upcoming schedule calendar slots.
* **States:** Loading spinner, Empty dashboard state, Error banners.

### B. Profile & Resume
* **Purpose:** Core personal details, skills configuration, and resume storage.
* **UI Components:** Text Inputs (Name, Email, Social links), Skill Badges (Interactive add/delete), Drag-and-Drop file uploader.
* **Backend Dependency:** `PATCH /api/candidate/profile`, `POST /api/resume/upload` (Muskan).
* **AI Dependency:** Shivam's parser to populate profile attributes from parsed resume.

### C. Jobs Search & Job Details
* **Purpose:** Job listing, searching, filtering, and application submission.
* **UI Components:** Search input, Filter dropdowns (Location, Salary, Department), Job description markdown container, "Apply Now" dialog button.
* **Backend Dependency:** `GET /api/jobs`, `POST /api/applications/apply` (Muskan).

### D. Assessments & Code Editor
* **Purpose:** Integrated testing environment for candidate code evaluation.
* **UI Components:** Problem description panel, Monaco Code Editor component, Language selector, Run/Submit buttons, Countdown timer.
* **Backend Dependency:** `GET /api/assessments/[id]`, `POST /api/assessments/[id]/submit` (Muskan).
* **AI Dependency:** Shivam's test grading metrics API feedback.

### E. Offers
* **Purpose:** Contract review and decision stage.
* **UI Components:** Offer letter PDF renderer, "Accept Offer" button, "Reject Offer" button.
* **Backend Dependency:** `POST /api/offers/[id]/decide` (Muskan).
