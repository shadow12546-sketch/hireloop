# UI States Guidelines

Every interface element requesting network resources must handle transitions gracefully.

## 1. Loading States (Skeletons)
* **Goal:** Prevent screen layout shifts by reserving sizes.
* **Component Specs:** Create a reusable `Skeleton` component styled with Tailwind's `animate-pulse` class.
* **Dashboards:** Use placeholder grey circles for KPIs and pulsing bars for table rows.

## 2. Empty States
* **Goal:** Direct users on what actions to take.
* **Component Specs:** An icon, a clear description, and a primary CTA button:
  * *Jobs Empty:* "No Active Jobs Found. Click 'Create Job' to post one."
  * *Notifications Empty:* "No notifications. Check back later."

## 3. Error States
* **Goal:** Prevent page crashes and offer recoveries.
* **Component Specs:** Use React **Error Boundaries** around widgets.
* **Recovery UI:** Display simple error banners: "Failed to load metrics. [Retry Button]".
