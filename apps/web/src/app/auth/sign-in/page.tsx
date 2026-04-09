"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/mine";
  const isFromExperience = next.startsWith("/experience");

  async function signInWithOAuth(provider: "google" | "github") {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      console.error("Auth error:", error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          IDEA MINE
        </h1>
        <p className="text-sm text-text-secondary">
          AI-powered idea exploration platform
        </p>
        {isFromExperience && (
          <p className="mt-2 max-w-xs text-xs leading-5 text-cold-cyan/80">
            이 광맥을 저장하고 본인의 Mine에서 이어가려면 로그인하세요.
          </p>
        )}
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={() => signInWithOAuth("google")}
          disabled={isLoading}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line-steel bg-surface-1 text-sm text-text-primary transition-colors hover:border-signal-pink/40 hover:bg-surface-2 disabled:opacity-50"
        >
          Google로 시작하기
        </button>

        <button
          onClick={() => signInWithOAuth("github")}
          disabled={isLoading}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-line-steel bg-surface-1 text-sm text-text-primary transition-colors hover:border-signal-pink/40 hover:bg-surface-2 disabled:opacity-50"
        >
          GitHub로 시작하기
        </button>
      </div>

      {isLoading && (
        <p className="text-xs text-text-secondary">연결하는 중...</p>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
