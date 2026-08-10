import Link from "next/link"
import {
  Search,
  Briefcase,
  Users,
  Trophy,
  Code2,
  BarChart3,
  Brain,
  Bell,
  FileText,
  Calendar,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  MapPin,
  Building2,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero py-20 md:py-28">
      {/* Blur orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-400/20 dark:bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-300/20 dark:bg-purple-700/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-200/15 dark:bg-indigo-900/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white dark:bg-card px-4 py-1.5 text-xs font-semibold text-primary mb-8 shadow-sm">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Recruitment Platform
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>

          {/* ✅ Gradient text — FIXED with inline style only, no conflicting class */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-foreground">
            Find Top Talent &amp;{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #251c4eff 0%, #767afeff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Dream Opportunities
            </span>
            {" "}— Powered by AI
          </h1>

          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The smartest ATS &amp; job platform. AI resume analysis, automated screening,
            coding assessments, and a complete hiring pipeline — all in one place.
          </p>

          {/* Search bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white dark:bg-card border border-border shadow-lg shadow-primary/10">
              <div className="flex items-center gap-2 flex-1 px-3 py-1">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
                />
              </div>
              <div className="hidden sm:block h-8 w-px bg-border self-center" />
              <div className="flex items-center gap-2 px-3 py-1 hidden sm:flex">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Remote / India</span>
              </div>
              <Button
                style={{ background: "linear-gradient(135deg, #251c4eff 0%, #767afeff 100%)" }}
                className="border-none text-white rounded-xl px-6 font-semibold hover:opacity-90 shrink-0"
              >
                Search
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Popular:{" "}
              {["React Developer", "AI/ML Engineer", "Product Manager", "Data Analyst"].map(
                (tag, i) => (
                  <Link key={tag} href="/#" className="text-primary hover:underline font-medium">
                    {tag}{i < 3 ? ", " : ""}
                  </Link>
                )
              )}
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register?role=candidate">
              <Button
                size="lg"
                style={{ background: "linear-gradient(135deg, #251c4eff 0%, #767afeff 100%)" }}
                className="border-none text-white font-bold rounded-xl px-8 hover:opacity-90 gap-2"
              >
                <Briefcase className="h-4 w-4" /> Find a Job
              </Button>
            </Link>
            <Link href="/register?role=recruiter">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 font-bold border-primary/40 text-primary hover:bg-primary/8 gap-2 dark:border-primary/40 dark:hover:bg-primary/10"
              >
                <Users className="h-4 w-4" /> Hire Talent
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: "5L+", label: "Registered Users", icon: Users },
            { value: "12K+", label: "Active Jobs", icon: Briefcase },
            { value: "800+", label: "Partner Companies", icon: Building2 },
            { value: "94%", label: "Placement Rate", icon: TrendingUp },
          ].map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl bg-white dark:bg-card border border-border shadow-sm p-5 text-center"
            >
              <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-black text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Company Strip ────────────────────────────────────────────────────────────
const companies = ["Google", "Microsoft", "Amazon", "Flipkart", "Zomato", "Razorpay", "Swiggy", "CRED"]

export function CompanyStrip() {
  return (
    <section className="border-y bg-muted/40 dark:bg-muted/20 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          Trusted by teams at top companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {companies.map((co) => (
            <div
              key={co}
              className="h-8 flex items-center justify-center text-sm font-extrabold text-muted-foreground/60 hover:text-primary transition-colors cursor-default select-none"
            >
              {co}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Opportunities ────────────────────────────────────────────────────────────
const opportunities = [
  {
    title: "Senior React Developer",
    company: "TechCorp India",
    location: "Bangalore · Remote",
    salary: "₹18–28 LPA",
    tags: ["React", "TypeScript", "Next.js"],
    badge: "Actively Hiring",
    // dark-friendly: no light-only bg colors
    badgeCls: "bg-green-500/15 text-green-400 dark:bg-green-500/20 dark:text-green-400 ring-1 ring-green-500/30",
    applicants: 142,
  },
  {
    title: "AI Innovation Challenge 2026",
    company: "DevFusion",
    location: "Online",
    salary: "₹5L Prize Pool",
    tags: ["AI/ML", "Full Stack", "Open to all"],
    badge: "Registrations Open",
    badgeCls: "bg-violet-500/15 text-violet-400 dark:bg-violet-500/20 dark:text-violet-400 ring-1 ring-violet-500/30",
    applicants: 2830,
  },
  {
    title: "Product Design Intern",
    company: "Razorpay",
    location: "Bangalore",
    salary: "₹50K/month",
    tags: ["Figma", "UI/UX", "Prototyping"],
    badge: "2 Days Left",
    badgeCls: "bg-orange-500/15 text-orange-400 dark:bg-orange-500/20 dark:text-orange-400 ring-1 ring-orange-500/30",
    applicants: 654,
  },
  {
    title: "ML Engineer",
    company: "Amazon",
    location: "Hyderabad · Hybrid",
    salary: "₹30–45 LPA",
    tags: ["Python", "TensorFlow", "MLOps"],
    badge: "Featured",
    badgeCls: "bg-blue-500/15 text-blue-400 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-500/30",
    applicants: 89,
  },
]

export function OpportunitiesSection() {
  return (
    <section id="opportunities" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black">
              Latest <span className="text-primary">Opportunities</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Fresh jobs and internships updated daily
            </p>
          </div>
          <Link href="/candidate/jobs">
            <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/8">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {["All", "Jobs", "Internships"].map((tab, i) => (
            <button
              key={tab}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border transition-all ${
                i === 0
                  ? "text-white border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40 dark:border-border"
              }`}
              style={i === 0 ? { background: "linear-gradient(135deg, #251c4eff 0%, #767afeff 100%)" } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {opportunities.map((op) => (
            <div
              key={op.title}
              className="group rounded-2xl border border-border bg-card p-6 card-hover cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shrink-0">
                  {op.company.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-bold text-base leading-snug group-hover:text-primary transition-colors truncate">
                        {op.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{op.company}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${op.badgeCls}`}>
                      {op.badge}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{op.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{op.salary}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{op.applicants.toLocaleString()} applicants</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {op.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 text-primary text-xs px-2.5 py-0.5 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: Brain,    title: "AI Resume Analysis",    desc: "Smart parsing extracts skills and gives an explainable match score against every job." },
  { icon: Code2,    title: "Coding Assessments",    desc: "In-browser IDE with auto-grading. Recruiters assign; candidates solve — results in real time." },
  { icon: BarChart3, title: "Recruiter Analytics",  desc: "Funnel charts, time-to-hire metrics, and candidate quality scores at a glance." },
  { icon: Calendar, title: "Smart Scheduling",      desc: "One-click interview scheduling synced across recruiter, interviewer, and candidate." },
  { icon: FileText, title: "Offer Management",      desc: "Generate, preview, send, and track offer letters. Candidates respond in-app." },
  { icon: Bell,     title: "Instant Notifications", desc: "Real-time alerts keep every stakeholder informed at each stage of the pipeline." },
  { icon: Users,    title: "Talent Pool",           desc: "Search and filter a rich pool of verified candidates by skills, experience, and location." },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30 dark:bg-muted/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black">
            A Platform Built for{" "}
            <span className="text-primary">Both Sides</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Whether you&apos;re hiring or being hired, every tool you need is right here.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-card border border-border p-6 card-hover group"
            >
              <div
                className="mb-4 h-11 w-11 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #251c4eff 0%, #767afeff 100%)" }}
              >
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-base mb-1.5 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
export function HowItWorksSection() {
  const steps = [
    { icon: Users,       step: "01", title: "Create Profile",          desc: "Sign up and build your profile in under 5 minutes." },
    { icon: FileText,    step: "02", title: "Upload Resume",            desc: "AI parses your resume and highlights your strengths instantly." },
    { icon: Search,      step: "03", title: "Apply to Opportunities",   desc: "Discover jobs, hackathons, and internships matched to your skills." },
    { icon: CheckCircle, step: "04", title: "Get Hired",                desc: "Complete assessments, attend interviews, and receive offers in-app." },
  ]

  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black">How It Works</h2>
          <p className="text-muted-foreground mt-3">From sign-up to success in four simple steps.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px border-t-2 border-dashed border-primary/20 z-0" />
              )}
              <div className="relative z-10">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  style={{ background: "linear-gradient(135deg,  #251c4eff 0%, #767afeff 100%)" }}
                >
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-primary mb-1">STEP {s.step}</p>
                <h3 className="font-bold text-base mb-2 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Software Engineer @ Google",
    text: "Got my dream job through DevFusion! The AI resume scoring helped me understand exactly what skills to highlight. The platform is incredibly easy to use.",
    stars: 5,
    avatar: "A",
  },
  {
    name: "Rajat Mehta",
    role: "Senior Recruiter @ Razorpay",
    text: "We reduced our screening time by 70% using AI-powered candidate matching. The kanban pipeline is a game changer for our hiring team.",
    stars: 5,
    avatar: "R",
  },
  {
    name: "Priya Nair",
    role: "Full Stack Intern @ Flipkart",
    text: "Won a hackathon through DevFusion which directly led to my internship offer. The coding assessment environment is smooth and fair.",
    stars: 5,
    avatar: "P",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30 dark:bg-muted/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black">
            Loved by <span className="text-primary">Thousands</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            Real stories from candidates and recruiters who found success here.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl bg-card border border-border p-6 card-hover flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground flex-1 mb-5">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm"
                  style={{ background: "linear-gradient(135deg, #251c4eff 0%, #767afeff 100%)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
export function CTASection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1c153c 0%, #251c4e 50%, #767afe 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/8 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/8 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
        <h2 className="text-3xl md:text-5xl font-black leading-tight">
          Your next opportunity<br />starts here. 🚀
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
          Join 5 lakh+ students and professionals already using DevFusion to find
          jobs, win competitions, and grow their careers.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register?role=candidate">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-black rounded-xl px-10 gap-2 shadow-xl"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register?role=recruiter">
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 font-bold rounded-xl px-10 bg-transparent"
            >
              Post a Job
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/50">
          No credit card required · Free forever for candidates
        </p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  const cols = [
    { heading: "Opportunities", links: ["Jobs", "Internships", "Hackathons", "Competitions", "Fellowships"] },
    { heading: "For Recruiters", links: ["Post a Job", "Talent Search", "Assessments", "Analytics", "Pricing"] },
    { heading: "Company",        links: ["About Us", "Blog", "Careers", "Press", "Contact"] },
    { heading: "Support",        links: ["Help Centre", "Privacy Policy", "Terms of Service", "Cookies"] },
  ]

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #251c4eff 0%, #767afeff 100%)" }}
              >
                <span className="text-white font-black text-sm">D</span>
              </div>
              <span className="font-extrabold text-xl text-foreground">
                Dev<span className="text-primary">Fusion</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered recruitment and talent discovery platform built for the next generation.
            </p>
          </div>
          <div className="flex gap-3">
            {["Twitter", "LinkedIn", "GitHub", "Discord"].map((s) => (
              <Link
                key={s}
                href="/#"
                className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                {s.charAt(0)}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="font-bold text-sm mb-4 text-foreground">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="/#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 DevFusion ATS · Built for DevFusion 4.0 Hackathon (PS-2)</p>
          <p>
            Made with ♥ by{" "}
            <span className="text-primary font-semibold">Sachin</span>,{" "}
            <span className="text-primary font-semibold">Muskan</span> &amp;{" "}
            <span className="text-primary font-semibold">Shivam</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
