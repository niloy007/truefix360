import { ZodError } from "zod";
import { RateLimitError } from "@/lib/forms/abuse";
import type { FormSubmitResult } from "@/types";

export function jsonError(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

export function jsonSuccess(result: FormSubmitResult) {
  return Response.json(result);
}

export function formErrorResponse(error: unknown) {
  if (error instanceof RateLimitError) {
    return jsonError(error.message, 429);
  }
  if (error instanceof ZodError) {
    return jsonError("Please check the form and try again.", 400);
  }
  if (error instanceof Error) {
    return jsonError(error.message, 400);
  }
  return jsonError("The form could not be submitted. Please try again.", 500);
}

export function readIdempotencyKey(request: Request, body?: FormData | Record<string, unknown>) {
  const header = request.headers.get("x-idempotency-key");
  if (header && header.length <= 80) return header;
  if (body instanceof FormData) {
    const value = body.get("idempotencyKey");
    return typeof value === "string" ? value.slice(0, 80) : null;
  }
  if (body && typeof body.idempotencyKey === "string") {
    return body.idempotencyKey.slice(0, 80);
  }
  return null;
}

export function parseJsonPayload(body: unknown) {
  if (typeof body !== "object" || body === null) return body;
  if ("payload" in body) return (body as { payload: unknown }).payload;
  return body;
}
