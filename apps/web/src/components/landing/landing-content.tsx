"use client";

import type { UserProfile } from "@/types/api";
import { useLanguage } from "@/hooks/use-language";
import { CoreLoopPreview } from "@/components/landing/core-loop-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingHero } from "@/components/landing/landing-hero";
import { ProductProof } from "@/components/landing/product-proof";
import { ReturnLoop } from "@/components/landing/return-loop";

export function LandingContent({
  hasUser,
  profile,
}: {
  hasUser: boolean;
  profile: UserProfile | null;
}) {
  const { lang } = useLanguage(profile);

  return (
    <>
      <LandingHero hasUser={hasUser} lang={lang} />
      <CoreLoopPreview lang={lang} />
      <ProductProof lang={lang} />
      <ReturnLoop lang={lang} />
      <FinalCta hasUser={hasUser} lang={lang} />
    </>
  );
}
