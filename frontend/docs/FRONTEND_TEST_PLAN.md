# Frontend Testing Plan

Sachin owns frontend validation and testing. This plan details test targets, scopes, and tools.

## 1. Authentication UI Tests
* Verify empty inputs prevent submissions.
* Verify email/password validity triggers matching validation errors.
* Validate correct routes redirection after successful login/registration.

## 2. Job & Candidates UI Tests
* Test job searches and verify match results.
* Test active filters (Location, Salary) and ensure listings update accordingly.
* Verify Kanban card movements trigger optimistic UI card translations and trigger API patches.

## 3. Resume & AI Result UI Tests
* Test drop files with sizes > 5MB and check error feedback warnings.
* Verify circular score gauge displays color-coded themes matching values.
* Verify skill gap checklist elements render correctly.

## 4. Assessment UI Tests
* Verify code editor registers syntax changes.
* Verify browser tab exit alert triggers warning popup.
* Verify timer countdown triggers automatic submit on expiry.

## 5. Technology Stack
* Use **Jest** and **React Testing Library** for unit component verification.
* Use **Playwright** or **Cypress** for end-to-end user-flow validation.
