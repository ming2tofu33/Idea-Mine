import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 미인증 사용자도 접근 가능한 퍼블릭 경로.
  // /mine은 게스트에게 데모 모드를 보여주므로 퍼블릭.
  // /experience는 호환성을 위해 유지 (page.tsx에서 /mine으로 redirect).
  const { pathname } = request.nextUrl;
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname === "/mine" ||
    pathname.startsWith("/experience") ||
    pathname.startsWith("/api/experience-events");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
