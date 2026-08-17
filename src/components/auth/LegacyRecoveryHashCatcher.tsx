"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { classifyAuthLinkError } from "@/lib/auth/password";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function readHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  return new URLSearchParams(hash);
}

export function LegacyRecoveryHashCatcher() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/auth/") || pathname === "/reset-password") return;

    const params = readHashParams();
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    const error = params.get("error");
    const errorCode = params.get("error_code");

    if (!accessToken && !error) return;
    if (type && type !== "recovery") return;

    window.history.replaceState(null, "", pathname);

    async function run() {
      if (error && !accessToken) {
        const kind = classifyAuthLinkError(error, errorCode) ?? "invalid";
        router.replace(`/reset-password?error=${kind}`);
        return;
      }
      if (!accessToken) return;
      try {
        const supabase = createBrowserSupabaseClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? "",
        });
        if (sessionError) {
          router.replace("/reset-password?error=invalid");
          return;
        }
        router.replace("/reset-password");
      } catch {
        router.replace("/reset-password?error=invalid");
      }
    }

    void run();
  }, [pathname, router]);

  return null;
}
