# Interview UI Specifications

Manages the scheduling, viewing, and feedback stages of interviews for Candidates, Recruiters, and Interviewers.

## 1. Candidate View
* **Details:** Upcoming Scheduled interviews, Date, Time, Duration, Interviewer Name, Join Interview Meeting URL (e.g. Teams, Zoom, or Google Meet).
* **Interactions:** "Add to Calendar" button (exports standard `.ics` file).

## 2. Recruiter View
* **Dashboard Component:** Drag-and-drop scheduler, slot reservation tool, or automated email invitation scheduler.
* **Fields:** Candidate dropdown, Interviewer dropdown, Date selector, Time start/end picker, Meeting Link input, Custom email body template.

## 3. Interviewer Assessment View
* **Dashboard:** "Assigned Interviews" list.
* **Interviews Screen Layout:**
  * **Left Column:** Live candidate profile preview & PDF resume document viewer.
  * **Right Column:** Feedback Form:
    * Rating Sliders (Coding Quality, System Design, Communication, Fit - 1 to 5).
    * Scoring Inputs (overall assessment status recommendation: Hire, No-Hire, Strong Hire, Strong No-Hire).
    * Feedback Notes textarea.
    * Submit button.
