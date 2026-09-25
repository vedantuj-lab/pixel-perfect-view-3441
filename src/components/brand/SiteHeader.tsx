import { Link, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function Mark({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-block rotate-45 rounded-[6px] bg-gradient-to-br from-primary to-cool ${
        size === "sm" ? "size-6" : "size-7"
      }`}
    />
  );
}

export function SiteHeader({ context }: { context?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-[15px] font-bold tracking-[0.22em]">BRANDMIND</span>
        </Link>
        <nav className="ml-8 hidden items-center gap-6 text-[13px] text-foreground/55 md:flex">
          <Link to="/dashboard" className="transition-colors hover:text-foreground">
            Workspace
          </Link>
          <Link to="/demo" className="transition-colors hover:text-foreground">
            Live demo
          </Link>
          <Link to="/" hash="engine" className="transition-colors hover:text-foreground">
            Brand DNA Engine
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {context ? (
            <span className="hidden font-mono text-[12px] text-cool md:inline">{context}</span>
          ) : null}
          {user ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
              className="rounded-lg border border-border bg-foreground/5 px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:bg-foreground/10"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in
            </Link>
          )}
          {user ? (
            <span className="size-8 rounded-full bg-gradient-to-br from-warm to-primary outline-2 -outline-offset-2 outline-foreground/20" />
          ) : null}
        </div>
      </div>
    </header>
  );
}
