import type { ZodSchema } from "zod";

export type ActionResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type SafeActionHandler<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

export function safeAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: SafeActionHandler<TInput, TOutput>,
): (raw: unknown) => Promise<ActionResult<TOutput>> {
  return async (raw: unknown) => {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.map(String).join(".") || "_";
        (fieldErrors[key] ??= []).push(issue.message);
      }
      return { ok: false, error: "Invalid input", fieldErrors };
    }
    try {
      const data = await handler(parsed.data);
      return { ok: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { ok: false, error: message };
    }
  };
}

export function formDataToObject(
  formData: FormData,
): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
  const out: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (const [key, value] of formData.entries()) {
    const existing = out[key];
    if (existing === undefined) {
      out[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      out[key] = [existing, value];
    }
  }
  return out;
}
