# User Roles Frontend Specifications

This document outlines the user roles, their dashboards, navigation paths, actions, permissions, and primary UI states.

> [!IMPORTANT]
> Frontend role-based UI is used to optimize user experience (UX) and guide users to correct paths; backend Role-Based Access Control (RBAC) remains the authoritative security boundary.

## 1. Candidate
* **Dashboard:** Candidate Portal Dashboard (personalized progress feed, application milestones, task items).
* **Navigation:** Profile, Jobs, My Applications, Interviews, Assessments, Offers, Notifications.
* **Main Actions:** Edit Profile, Upload/Replace Resume, Browse Jobs, Search & Filter Jobs, Submit Job Applications, Attempt Coding Assessments, View/Respond to Offers (Accept/Reject).
* **Important UI States:** Resume processing spinner, upcoming assessment countdown timer, job application success toast, empty-state job list.

## 2. Recruiter
* **Dashboard:** Recruiter Dashboard (KPIs: Active Jobs, Active Candidates, Pending Reviews, Offer Acceptance Rate).
* **Navigation:** Jobs Management, Candidate Database, Application Pipeline (Kanban), Scheduling, Analytics, Offers, Notifications.
* **Main Actions:** Create/Edit Job Postings, Move candidates through Kanban stages, Schedule interviews, Assign assessments, Generate/Send offer letters.
* **Important UI States:** Drag-and-drop success, loading funnel charts, invalid deadline date warning.

## 3. Hiring Manager
* **Dashboard:** Candidate Overview Dashboard & Performance Analytics.
* **Navigation:** Candidate Review, Decisions, Assessment Reports, Analytics.
* **Main Actions:** Review AI Resume Scores, Read interviewer comments, Approve/Reject shortlisting, Authorize offer letters.
* **Important UI States:** Match score visual meter, missing skills highlight warnings, decision logs.

## 4. Interviewer
* **Dashboard:** Assigned Interviews & Upcoming Slots.
* **Navigation:** Interviews List, Candidate Profile (Read-only), Feedback Forms.
* **Main Actions:** View candidate resume, join meeting link, complete feedback form (scores & comments).
* **Important UI States:** Interview feedback submission confirmation, active countdown to meeting start time.

## 5. Admin
* **Dashboard:** Admin panel showing overall tenant/system-wide summary.
* **Navigation:** User Management, Role Configurations, Companies/Tenants, System Settings, Audit Logs, Globals.
* **Main Actions:** Add/Remove users, Change roles, Configure system variables, View audit logging.
* **Important UI States:** System settings updated toast, full page loader during audit log extraction.
