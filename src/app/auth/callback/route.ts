import { NextResponse } from "next/server";
import { getSiteUrl, isSupabaseConfigured } from "@/config/env";
import {
  callbackDestination,
  callbackFailurePath,
  establishSessionFromCallbackSearch,
} from "@/lib/auth/session-from-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = callbackDestination(url.searchParams, "/reset-password");
  const site = getSiteUrl();

  if (!isSupabaseConfigured()) {
    const failed = callbackFailurePath(next);
    const destination = new URL(failed, site);
    destination.searchParams.set("error", "not_configured");
    return NextResponse.redirect(destination);
  }

  const result = await establishSessionFromCallbackSearch(url.searchParams);
  if (!result.ok) {
    const destination = new URL(callbackFailurePath(next), site);
    destination.searchParams.set("error", result.kind);
    return NextResponse.redirect(destination);
  }

  return NextResponse.redirect(new URL(next, site));
}
