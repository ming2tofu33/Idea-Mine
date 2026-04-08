import Link from "next/link";
import { ObservatoryBackground } from "@/components/backgrounds/observatory-background";
import { LandingHero } from "@/components/landing/landing-hero";
import { signalButtonClassName } from "@/components/shared/signal-button-styles";
import { StatusRail } from "@/components/shared/status-rail";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <ObservatoryBackground variant="landing" intensity="hero" />

      <div className="relative z-10 px-4 py-3 sm:px-6">
        <StatusRail
          variant="landing"
          left={
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tracking-[0.16em] text-text-primary">
                IDEA MINE
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-text-secondary/70 md:inline">
                Observatory Online
              </span>
            </div>
          }
          center={
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-text-secondary/65 lg:inline">
              Signal Mapping / Asset Discovery / Archive System
            </span>
          }
          right={
            <div className="flex items-center gap-2">
              <Link
                href="/auth/sign-in"
                className={signalButtonClassName({
                  variant: "ghost",
                  className: "px-3 py-1.5 text-xs",
                })}
              >
                Sign in
              </Link>
              <Link
                href={user ? "/mine" : "/auth/sign-in"}
                className={signalButtonClassName({
                  variant: "default",
                  className: "px-3 py-1.5 text-xs",
                })}
              >
                Enter Mine
              </Link>
            </div>
          }
        />
      </div>

      <LandingHero hasUser={Boolean(user)} />

      <section
        id="core-loop"
        aria-label="Core loop insertion point"
        className="relative z-10 readable-container py-3"
      >
        <div className="rounded-lg border border-dashed border-line-steel/35 bg-surface-1/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-text-secondary/70">
          Task 3 Target / Core Loop Preview
        </div>
      </section>

      <section
        id="product-proof"
        aria-label="Product proof insertion point"
        className="relative z-10 readable-container pb-6"
      >
        <div className="rounded-lg border border-dashed border-line-steel/35 bg-surface-1/30 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-text-secondary/70">
          Task 3 Target / Product & Interface Proof
        </div>
      </section>
    </div>
  );
}
