import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">
          IDEA MINE
        </h1>
        <p className="max-w-md text-lg text-text-secondary">
          AI-powered idea exploration platform
        </p>
      </div>

      {user ? (
        <Link
          href="/mine"
          className="rounded-lg border border-signal-pink/30 bg-surface-2 px-8 py-3 text-sm text-signal-pink transition-colors hover:border-signal-pink/60"
        >
          광산으로 들어가기
        </Link>
      ) : (
        <Link
          href="/auth/sign-in"
          className="rounded-lg border border-signal-pink/30 bg-surface-2 px-8 py-3 text-sm text-signal-pink transition-colors hover:border-signal-pink/60"
        >
          시작하기
        </Link>
      )}
    </div>
  );
}
