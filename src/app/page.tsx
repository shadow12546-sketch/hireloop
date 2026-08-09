import { LandingNav } from "@/components/landing/LandingNav"
import {
  HeroSection,
  CompanyStrip,
  OpportunitiesSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "@/components/landing/LandingSections"

export const metadata = {
  title: "DevFusion ATS — Find Jobs, Hackathons & Top Talent with AI",
  description:
    "India's smartest AI-powered recruitment and applicant tracking platform. Discover jobs, internships, hackathons, and competitions. Recruiters: hire smarter with AI resume screening, coding assessments, and pipeline automation.",
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <CompanyStrip />
        <OpportunitiesSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
