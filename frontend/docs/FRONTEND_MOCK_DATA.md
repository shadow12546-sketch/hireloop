# Frontend Mock Data Strategy

Sachin needs to develop the frontend independently without being blocked by backend (Muskan) or AI (Shivam) developments. This strategy details how mock configurations will run.

## 1. Directory Setup
Store mock structures in:
`src/mocks/` or `src/fixtures/`

## 2. Dynamic Toggle Config
Create an environment flag inside `.env.development`:
```
NEXT_PUBLIC_API_MOCKING=true
```

## 3. Mock Service Decorator pattern
Implement API service wrappers that check this flag before returning simulated data:

```typescript
import { mockJobs } from "../mocks/jobs";
import { Job } from "../types";

export class JobService {
  static async getAll(): Promise<Job[]> {
    if (process.env.NEXT_PUBLIC_API_MOCKING === "true") {
      // Simulate API network latency
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockJobs;
    }
    const response = await fetch("/api/jobs");
    return response.json();
  }
}
```

## 4. Rule Book for Mock Data
* Do not import mock data directly into components; components must fetch via services.
* Label mock data clearly with names like `dummyResumeResult` or `tempCandidateList` so they are easy to search for.
* Never commit real credentials or production mock variables to the repository.
