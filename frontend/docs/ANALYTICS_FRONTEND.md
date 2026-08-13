# Analytics Frontend

This document guides the design and data modeling for the dashboards, charts, and metrics displays.

## 1. Metric Indicators & Formatting
* **Conversion / Success Rates:** Must format to one decimal place (e.g. `92.4%`).
* **Financial Details:** Currency strings (e.g. `$120,000`).
* **Duration Metrics:** Express in days (e.g. "Time-to-Hire: 14 days").

## 2. Dynamic Charts Implementation
* **Funnel Chart:** Visualizes volume of applicants passing from stage to stage. Interactive node click shows candidate names inside that specific funnel node.
* **Monthly Hires Trend:** Multi-line chart compares hiring velocity across departments (Engineering, Marketing, HR).
* **Skills Demand Radar Chart:** Shows target skills sought in recent postings versus actual talent skills in pool.

## 3. Tech Stack Recommendation
* Use **Recharts** or **Chart.js** library widgets.
* Ensure container scales inside grid layout blocks (`h-80` to `h-96`).
* Must support clean SVG render to allow high-contrast toggles during Dark/Light theme changes.
