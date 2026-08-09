import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left gradient brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(262 80% 50%) 0%, hsl(291 64% 42%) 100%)" }}
      >
        {/* Background circles */}
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-white/5" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-base">D</span>
          </div>
          <span className="font-extrabold text-xl text-white">DevFusion</span>
        </Link>

        {/* Quote */}
        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-black text-white leading-snug">
            &ldquo;The best way to predict the future is to create it.&rdquo;
          </blockquote>
          <p className="text-white/70 text-sm">
            Join 5L+ candidates and 800+ recruiters already building the future together.
          </p>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { v: "5L+", l: "Users" },
              { v: "12K+", l: "Active Jobs" },
              { v: "94%", l: "Placement Rate" },
              { v: "800+", l: "Companies" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                <p className="text-white font-black text-xl">{s.v}</p>
                <p className="text-white/70 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative dots grid */}
        <div className="absolute bottom-12 right-12 grid grid-cols-5 gap-2 opacity-20 z-0">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-white" />
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 bg-background">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="h-8 w-8 gradient-violet rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">D</span>
          </div>
          <span className="font-extrabold text-xl">
            Dev<span className="text-primary">Fusion</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">{children}</div>

        <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
          By signing up, you agree to our{" "}
          <Link href="/#" className="underline underline-offset-2 hover:text-foreground">Terms</Link>{" "}
          and{" "}
          <Link href="/#" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
