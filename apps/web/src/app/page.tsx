import { ObservatoryBackground } from "@/components/backgrounds/observatory-background";
import { CoreLoopPreview } from "@/components/landing/core-loop-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingHero } from "@/components/landing/landing-hero";
import { PositioningBand } from "@/components/landing/positioning-band";
import { ProductProof } from "@/components/landing/product-proof";
import { AppHeader } from "@/components/shared/app-header";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/api";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile: UserProfile | null = user
    ? (
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <ObservatoryBackground variant="landing" intensity="hero" />

      <AppHeader user={user} profile={profile} />

      <LandingHero hasUser={Boolean(user)} />
      <CoreLoopPreview />
      <ProductProof />
      <PositioningBand />
      <FinalCta hasUser={Boolean(user)} />
    </div>
  );
}
