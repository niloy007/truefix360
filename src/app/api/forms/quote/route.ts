import { submitQuote } from "@/lib/forms/public";
import { formErrorResponse, jsonSuccess, readIdempotencyKey } from "@/lib/forms/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") ?? "0");
    if (length > 55 * 1024 * 1024) {
      return Response.json({ message: "The request is too large." }, { status: 413 });
    }
    const form = await request.formData();
    const raw = form.get("payload");
    const payload = typeof raw === "string" ? JSON.parse(raw) : {};
    const files = form
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);
    const result = await submitQuote(payload, files, readIdempotencyKey(request, form));
    return jsonSuccess(result);
  } catch (error) {
    return formErrorResponse(error);
  }
}
