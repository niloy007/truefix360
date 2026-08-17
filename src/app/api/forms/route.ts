import { submitContact, submitCoverage, submitQuote, submitVendor } from "@/lib/forms/public";
import { formErrorResponse, jsonSuccess, parseJsonPayload, readIdempotencyKey } from "@/lib/forms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const kind = isRecord(body) ? body.kind : null;
    const payload = parseJsonPayload(body);
    const key = readIdempotencyKey(request, isRecord(body) ? body : undefined);

    if (kind === "contact") return jsonSuccess(await submitContact(payload, key));
    if (kind === "quote") return jsonSuccess(await submitQuote(payload, [], key));
    if (kind === "vendor-application") return jsonSuccess(await submitVendor(payload, key));
    if (kind === "coverage-inquiry") return jsonSuccess(await submitCoverage(payload, key));

    return Response.json({ message: "A valid form type is required." }, { status: 400 });
  } catch (error) {
    return formErrorResponse(error);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
