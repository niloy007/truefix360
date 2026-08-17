"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { classifyAuthLinkError } from "@/lib/auth/password";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthHashSessionCatcherProps = {
  children: React.ReactNode;
  workingLabel: string;
  gate?: boolean;
};

function readLinkParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);
  return {
    accessToken: hashParams.get("access_token") ?? queryParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token") ?? queryParams.get("refresh_token"),
    error: hashParams.get("error") ?? queryParams.get("error"),
    errorCode: hashParams.get("error_code") ?? queryParams.get("error_code"),
    hasHash: hash.length > 0,
  };
}

function replaceWithError(kind: string) {
  const next = new URL(window.location.pathname, window.location.origin);
  next.searchParams.set("error", kind);
  window.history.replaceState(null, "", `${next.pathname}${next.search}`);
}

function stripAuthParams() {
  window.history.replaceState(null, "", window.location.pathname);
}

export function AuthHashSessionCatcher({
  children,
  workingLabel,
  gate = true,
}: AuthHashSessionCatcherProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<"pending" | "idle">(gate ? "pending" : "idle");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const link = readLinkParams();
      const hasSessionPayload = Boolean(link.accessToken || (link.hasHash && link.error));

      if (!hasSessionPayload) {
        if (!cancelled) setPhase("idle");
        return;
      }

      if (link.error && !link.accessToken) {
        const kind = classifyAuthLinkError(link.error, link.errorCode) ?? "invalid";
        stripAuthParams();
        replaceWithError(kind);
        if (!cancelled) setPhase("idle");
        router.refresh();
        return;
      }

      if (!link.accessToken) {
        if (!cancelled) setPhase("idle");
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.setSession({
          access_token: link.accessToken,
          refresh_token: link.refreshToken ?? "",
        });
        stripAuthParams();
        if (error) {
          replaceWithError("invalid");
          if (!cancelled) setPhase("idle");
          router.refresh();
          return;
        }
        router.replace(window.location.pathname);
        router.refresh();
      } catch {
        stripAuthParams();
        replaceWithError("invalid");
        if (!cancelled) setPhase("idle");
        router.refresh();
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (gate && phase === "pending") {
    return <p className="text-sm leading-6 text-muted">{workingLabel}</p>;
  }

  return <>{children}</>;
}
