import { submitCoverage } from "@/lib/forms/public";
import { formErrorResponse, jsonSuccess, parseJsonPayload, readIdempotencyKey } from "@/lib/forms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseJsonPayload(body);
    const key = readIdempotencyKey(request, body && typeof body === "object" ? (body as Record<string, unknown>) : undefined);
    return jsonSuccess(await submitCoverage(payload, key));
  } catch (error) {
    return formErrorResponse(error);
  }
}
