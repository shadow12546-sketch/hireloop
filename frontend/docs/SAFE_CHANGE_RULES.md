# Project Safety Rules

Guidelines to prevent breaking changes when editing files.

> [!IMPORTANT]
> Always extend existing architectures. Do not rebuild from scratch.

## 1. Safety Checklist (Before Modifying Code)
* [ ] Inspect folder structures and check for existing helper components.
* [ ] Do not change router libraries or configurations without coordinating.
* [ ] Check if styling themes (e.g. Tailwind configuration) are already set up.
* [ ] Do not change API URL endpoints or configuration parameters.

## 2. API & Data Safety Rules
* Do not modify endpoints or data contracts without coordinating with Muskan (Backend) and Shivam (AI).
* Keep local configurations in `.env.example` templates; never commit `.env` files with API keys or secrets.
* Make sure mock data is isolated and easily toggled off for integration testing.

## 3. Collaboration Boundaries
* Keep code modular so it is easy to integrate.
* Focus commits on specific components and features.
* Coordinate with teammates before modifying shared configuration files.
