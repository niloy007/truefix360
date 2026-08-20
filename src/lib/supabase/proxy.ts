import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getPublicSupabasePublishableKey,
  getPublicSupabaseUrl,
  isBrowserSupabaseConfigured,
} from "@/config/public-env";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isBrowserSupabaseConfigured()) {
    return protectUnconfigured(request, response);
  }

  const url = getPublicSupabaseUrl();
  const key = getPublicSupabasePublishableKey();
  let supabaseResponse = response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/portal") ||
    path.startsWith("/vendor-network");

  if (isProtected && !user) {
    const login = new URL("/login", request.url);
    const next = `${path}${request.nextUrl.search}`;
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  return supabaseResponse;
}

function protectUnconfigured(request: NextRequest, response: NextResponse) {
  const path = request.nextUrl.pathname;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/portal") ||
    path.startsWith("/vendor-network")
  ) {
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "not_configured");
    return NextResponse.redirect(login);
  }
  return response;
}
