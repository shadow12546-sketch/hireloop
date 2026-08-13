import { redirect } from "next/navigation"

/**
 * The Hiring Manager role has been consolidated into the Employer role.
 * This page redirects to the employer dashboard.
 */
export default function ManagerRedirect() {
  redirect("/recruiter")
}
