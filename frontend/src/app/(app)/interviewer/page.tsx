import { redirect } from "next/navigation"

/**
 * The Interviewer role has been consolidated into the Employer role.
 * This page redirects to the employer dashboard.
 */
export default function InterviewerRedirect() {
  redirect("/recruiter")
}
