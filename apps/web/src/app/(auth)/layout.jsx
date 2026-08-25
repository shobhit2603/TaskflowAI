import Link from "next/link";

export const metadata = {
  title: "Sign In | TaskflowAI",
};

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background p-4">

      {/* ── Decorative gradient orbs ────────────────────────────────────── */}
      <div
        className="orb w-125 h-125 -top-32 -left-32"
        style={{ background: "oklch(0.63 0.22 280)" }}
      />
      <div
        className="orb w-100 h-100 -bottom-24 -right-24"
        style={{ background: "oklch(0.60 0.20 310)" }}
      />

      {/* ── Center card ──────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm z-10 animate-scale-in">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13H11L10 22L20.5 11H14L13 2Z"
                fill="currentColor" className="text-primary-foreground" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight gradient-text">TaskflowAI</h1>
          <p className="text-xs text-muted-foreground mt-1">AI-powered task management</p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-6">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Secured with JWT · Powered by Mistral AI
        </p>
      </div>
    </div>
  );
}
