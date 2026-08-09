# Admin UI Specifications

The Admin Control Panel lets system administrators monitor system performance and manage configurations.

## 1. User & Role Management Tab
* **Components:** Searchable User grid, active role toggle switches, user create/delete modals.
* **Fields:** ID, User Name, Email, Active Status, Current Role (Dropdown selection: Admin, Recruiter, Candidate, HM, Interviewer).

## 2. Platform settings Configuration Tab
* **Settings:** Toggle API integrations, configure email templates, configure OAuth endpoints, set default session timeouts.
* **Save State:** Form validation, dirty form warning dialog, and success saving indicator.

## 3. System Auditing Logs Screen
* **Log Table Columns:** Timestamp, Actor User, Category (Security, Data, Configuration), Action (e.g., "Updated Job status"), Source IP address.
* **Search Filters:** Date picker inputs (Start/End), search text, category filter, download logs (.CSV format).
