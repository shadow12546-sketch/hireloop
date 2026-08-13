# Notification UI Specifications

The system notifications alert users about updates throughout the hiring lifecycle.

## 1. Notification Categories
* **Application Status Updates:** "Your application for Senior React Engineer has been updated to Shortlisted."
* **Scheduling Requests:** "A new interview slot has been proposed for tomorrow at 2:00 PM."
* **Assessment Requests:** "Please complete the Frontend JavaScript Assessment by August 15th."
* **Offer Received:** "A formal offer letter has been extended to you."

## 2. Shared Components
* **Notification Badge Counter:** Placed next to nav headers, showing number of unread alerts.
* **Notification Drawer/Pop-over:** Overlay list displaying recent entries. Includes "Mark all as read" button.
* **Notifications History Page:** Full dashboard layout grouping notifications by date (Today, Yesterday, Older).

## 3. UI States
* **Unread Notification Card:** Sleek border, subtle colored accent background (e.g. blue indicator dot).
* **Read Notification Card:** Plain background, lower opacity text.
* **Empty State:** Centered bell icon with text: "All caught up! No new notifications."
