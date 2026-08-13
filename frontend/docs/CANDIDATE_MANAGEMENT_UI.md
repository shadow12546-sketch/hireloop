# Candidate Management UI

Provides interfaces to view, filter, evaluate, and track candidates.

## 1. Candidate List & Table Specifications
* **Columns:** Candidate Name, Applied Role, Application Date, Stage (Badge), AI Match Score (Interactive color-coded badge), Action Buttons (View Profile, Schedule Interview, Send Message).
* **Search / Filter Bar:** Text search for name/skills, filters for score range (e.g. `> 80%`), stage, and job role.
* **Pagination:** Standard page selectors (10, 25, 50 rows per page) and infinite scroll alternate option.

## 2. Candidate Detail View & Profile Layout
* **Left Sidebar:** Candidate avatar, contact details, tags, CV download button, and social links.
* **Main Area (Tabbed Navigation):**
  1. **Profile Details:** Extracted skills, work experience list, education list.
  2. **AI Resume Score:** Breakdown of matching skills, missing keywords, scoring justification.
  3. **Assessments:** List of tests, status, score, and submission link.
  4. **Interviews:** History of scheduled slots, interviewer names, and submitted scores/comments.
  5. **Offers:** Sent offers list and status (Pending/Accepted/Rejected).
