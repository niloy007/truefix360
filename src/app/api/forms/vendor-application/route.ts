import { submitVendor } from "@/lib/forms/public";
import { formErrorResponse, jsonSuccess, parseJsonPayload, readIdempotencyKey } from "@/lib/forms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") ?? "0");
    if (length > 80_000) {
      return Response.json({ message: "The request is too large." }, { status: 413 });
    }
    const body = await request.json();
    const result = await submitVendor(parseJsonPayload(body), readIdempotencyKey(request, body));
    return jsonSuccess(result);
  } catch (error) {
    return formErrorResponse(error);
  }
}
