# Job Management Frontend

This document outlines the UI specifications for managing jobs.

## 1. Job Model Fields
* **Job Title** (String, required)
* **Department** (String, required)
* **Location** (String, required)
* **Salary Range** (Object: min/max/currency)
* **Experience Level** (String/Enum: Junior, Mid, Senior, Lead)
* **Skills** (Array of Strings)
* **Employment Type** (Enum: Full-Time, Part-Time, Contract, Internship)
* **Work Mode** (Enum: Remote, On-Site, Hybrid)
* **Application Deadline** (Date)
* **Job Description** (Markdown text content)
* **Company Details** (String/Object)
* **Status** (Enum: Draft, Active, Closed)

## 2. Key Screen Workflows

### A. Job Search & Filter (Candidate Portal)
* **Filters Panel:** Search bar, Location dropdown, Department multi-select, Work mode chips.
* **Layout:** Grid cards or split-screen listing with active selections on the left.

### B. Job Creation & Editing Wizard (Recruiter/HM Panel)
* **Inputs:** Multi-step wizard or organized tabs (Basic Info, Description & Markdown, Skills & Requirements, Settings & Deadline).
* **Validation:** Title, department, location validation; date deadline cannot be in the past.

### C. Job Detail View
* **Sections:** Header (Title, metadata), Body (Markdown description), Sidebar (Quick facts, deadline, and interactive Action buttons).
