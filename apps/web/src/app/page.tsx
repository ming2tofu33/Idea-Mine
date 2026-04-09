import Link from "next/link";
import { ObservatoryBackground } from "@/components/backgrounds/observatory-background";
import { CoreLoopPreview } from "@/components/landing/core-loop-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingHero } from "@/components/landing/landing-hero";
import { PositioningBand } from "@/components/landing/positioning-band";
import { ProductProof } from "@/components/landing/product-proof";
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
                href={user ? "/vault" : "/auth/sign-in?next=/mine"}
                className={signalButtonClassName({
                  variant: "ghost",
                  className: "px-3 py-1.5 text-xs",
                })}
              >
                {user ? "Open Vault" : "Sign in"}
              </Link>
              <Link
                href={user ? "/mine" : "/experience"}
                className={signalButtonClassName({
                  variant: "default",
                  className: "px-3 py-1.5 text-xs",
                })}
              >
                {user ? "Enter Mine" : "Try today's vein"}
              </Link>
            </div>
          }
        />
      </div>

      <LandingHero hasUser={Boolean(user)} />
      <CoreLoopPreview />
      <ProductProof />
      <PositioningBand />
      <FinalCta hasUser={Boolean(user)} />
    </div>
  );
}
