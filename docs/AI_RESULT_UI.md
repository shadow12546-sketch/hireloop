# AI Result UI Visualization

This document details how the AI processing results (delivered from Shivam's AI stack) are represented in the frontend layout.

## 1. Visualization Elements

### A. Match Score Gauge
* A circular progress ring or high-impact score widget.
* Dynamic color coding:
  * **90% - 100%:** Emerald Green (Excellent Match)
  * **70% - 89%:** Bright Blue (Strong Candidate)
  * **50% - 69%:** Amber Orange (Borderline Profile)
  * **Below 50%:** Rose Red (Low Match)

### B. Skill Gap Analysis Panel
* Comparative columns listing:
  1. **Candidate Skills** (Green checkmark badges)
  2. **Missing Job Requirements** (Red warning badges)
* Visualization chart mapping candidates' proficiency level vs expectations.

### C. Strengths & Recommendations Card
* bullet point summaries of strong candidate traits.
* AI recommendations (e.g., "Candidate needs exposure to Kubernetes; suggest assigning standard backend assessment").

## 2. Proposed AI Handoff Contract (JSON)

```json
{
  "matchScore": 87,
  "strengths": [
    "5+ years of active React/TypeScript experience",
    "Strong system architecture fundamentals"
  ],
  "missingSkills": [
    "AWS Lambda",
    "TailwindCSS configuration"
  ],
  "recommendations": [
    "Candidate matches senior roles. Proceed to live technical interview.",
    "Recommend verifying basic cloud deployment skills."
  ]
}
```
> [!NOTE]
> The contract is mockable on the frontend and is subject to updates based on Shivam's actual model outputs.
