import { PLACEHOLDER_MESSAGE } from "@/lib/submit";
import type { FormKind, FormSubmitResult } from "@/types";

const allowedKinds: FormKind[] = [
  "contact",
  "quote",
  "vendor-application",
  "coverage-inquiry",
];

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "The request body was not valid JSON." },
      { status: 400 },
    );
  }

  if (!isRecord(body) || !isFormKind(body.kind) || !isRecord(body.payload)) {
    return Response.json(
      { message: "A valid form type and payload are required." },
      { status: 400 },
    );
  }

  const result: FormSubmitResult = {
    ok: true,
    mode: "placeholder",
    receivedAt: new Date().toISOString(),
    message: PLACEHOLDER_MESSAGE,
  };

  return Response.json(result);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFormKind(value: unknown): value is FormKind {
  return typeof value === "string" && allowedKinds.includes(value as FormKind);
}
