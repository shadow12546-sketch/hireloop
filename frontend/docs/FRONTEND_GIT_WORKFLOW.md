# Git Workflow Guidelines

To maintain a clean repository structure and prevent conflicts while pair programming.

## 1. Branch Naming Rules
* All development must happen on feature branches branched off the default development branch.
* Prefix names:
  * `feature/landing-page`
  * `feature/candidate-dashboard`
  * `feature/recruiter-dashboard`
  * `feature/kanban`
  * `feature/api-services`

## 2. Standard Workflow Steps
1. **Pull Latest Changes:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit Code:** Keep commits atomic.
   ```bash
   git add .
   git commit -m "feat: implement responsive Kanban columns"
   ```
4. **Push & Open PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

## 3. General Safety Rules
* Do not commit `.env` configuration files containing local environment values.
* Do not modify files owned by Shivam (AI/Deployment) or Muskan (Backend Services) without coordinating first.
* Resolve conflicts locally before asking to merge.
