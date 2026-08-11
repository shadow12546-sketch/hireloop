import Link from "next/link"
import { Sparkles, BarChart, Users, CheckCircle2 } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left professional brand panel */}
      <div 
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0a20 0%, #1a1338 50%, #2f34a8 100%)" }}
      >
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />

        {/* Dashboard minimal skeleton graphic */}
        <div className="absolute right-0 top-[20%] w-[350px] translate-x-1/3 rotate-[-5deg] rounded-xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl pointer-events-none">
          <div className="flex gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-white/20" />
            <div className="h-3 w-3 rounded-full bg-white/20" />
            <div className="h-3 w-3 rounded-full bg-white/20" />
          </div>
          <div className="h-4 w-1/3 rounded bg-white/20 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="h-8 w-8 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-1/2 rounded bg-white/20" />
                  <div className="h-2 w-3/4 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10 w-max">
          <div className="h-9 w-9 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-inner">
            <span className="text-white font-black text-base">H</span>
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">HireLoop</span>
        </Link>

        {/* Enterprise Messaging */}
        <div className="relative z-10 my-auto py-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-3 py-1.5 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Recruitment
          </div>
          <h1 className="text-4xl lg:text-[2.75rem] font-black text-white leading-[1.15] mb-6">
            Build better teams with intelligent recruitment.
          </h1>
          <p className="text-blue-100/70 text-lg max-w-md mb-10 leading-relaxed font-medium">
            The all-in-one platform to source, screen, and hire top talent globally, without the friction.
          </p>

          <div className="space-y-5">
            {[
              { icon: Users, text: "AI-assisted candidate screening" },
              { icon: CheckCircle2, text: "Streamlined hiring workflow" },
              { icon: BarChart, text: "Advanced recruitment analytics" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                  <item.icon className="h-4 w-4 text-blue-300" />
                </div>
                <span className="text-blue-50/90 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Trust signal */}
        <div className="relative z-10 flex items-center justify-between pt-6">
          <p className="text-white/40 text-sm font-medium">© {new Date().getFullYear()} HireLoop Inc.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-background">
        <div className="w-full max-w-[420px] flex flex-col justify-center">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #251c4e 0%, #767afe 100%)" }}>
              <span className="text-white font-black text-sm">H</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              HireLoop
            </span>
          </Link>

          {children}

        </div>
      </div>
    </div>
  )
}
