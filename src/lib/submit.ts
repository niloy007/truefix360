import { formSubmission } from "@/config/site";
import type { FormKind, FormSubmitResult } from "@/types";

const PLACEHOLDER_MESSAGE =
  "Your information was validated by the website. Production email, database, and document storage are not connected yet, so this submission was not permanently saved. Please keep a copy of what you sent if the request is time-sensitive.";

export async function submitForm(
  kind: FormKind,
  payload: Record<string, unknown>,
): Promise<FormSubmitResult> {
  const response = await fetch(formSubmission.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, payload }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      errorBody?.message ?? "The form could not be submitted. Please try again.",
    );
  }

  return (await response.json()) as FormSubmitResult;
}

export function placeholderResult(): FormSubmitResult {
  return {
    ok: true,
    mode: "placeholder",
    receivedAt: new Date().toISOString(),
    message: PLACEHOLDER_MESSAGE,
  };
}

export { PLACEHOLDER_MESSAGE };
