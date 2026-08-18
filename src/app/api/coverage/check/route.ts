import { checkCoverage } from "@/lib/coverage/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await checkCoverage({
    state: url.searchParams.get("state") ?? "",
    county: url.searchParams.get("county") ?? "",
    service: url.searchParams.get("service") ?? "",
  });
  if ("error" in result) {
    return Response.json({ message: result.error }, { status: 400 });
  }
  return Response.json({
    status: result.status,
    marketState: result.marketState,
    countyName: result.countyName,
    stateCode: result.stateCode,
    serviceCategory: result.serviceCategory,
    serviceLabel: result.serviceLabel,
  });
}
