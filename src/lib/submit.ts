import type { FormKind, FormSubmitResult } from "@/types";

const endpoints: Record<FormKind, string> = {
  contact: "/api/forms/contact",
  quote: "/api/forms/quote",
  "vendor-application": "/api/forms/vendor-application",
  "coverage-inquiry": "/api/forms",
};

export function createIdempotencyKey(kind: FormKind): string {
  const storageKey = `tf360-idem-${kind}`;
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    sessionStorage.setItem(storageKey, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

export function clearIdempotencyKey(kind: FormKind) {
  try {
    sessionStorage.removeItem(`tf360-idem-${kind}`);
  } catch {
    // ignore
  }
}

export async function submitForm(
  kind: FormKind,
  payload: Record<string, unknown>,
): Promise<FormSubmitResult> {
  const idempotencyKey = createIdempotencyKey(kind);
  const response = await fetch(endpoints[kind], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ kind, payload, idempotencyKey }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      errorBody?.message ?? "The form could not be submitted. Please try again.",
    );
  }

  const result = (await response.json()) as FormSubmitResult;
  if (result.ok && result.referenceNumber) {
    clearIdempotencyKey(kind);
  }
  return result;
}

export async function submitQuoteForm(
  payload: Record<string, unknown>,
  files: File[],
): Promise<FormSubmitResult> {
  const idempotencyKey = createIdempotencyKey("quote");
  const body = new FormData();
  body.append("payload", JSON.stringify(payload));
  body.append("idempotencyKey", idempotencyKey);
  files.forEach((file) => body.append("files", file));

  const response = await fetch("/api/forms/quote", {
    method: "POST",
    headers: { "X-Idempotency-Key": idempotencyKey },
    body,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      errorBody?.message ?? "The form could not be submitted. Please try again.",
    );
  }

  const result = (await response.json()) as FormSubmitResult;
  if (result.ok && result.referenceNumber) {
    clearIdempotencyKey("quote");
  }
  return result;
}
