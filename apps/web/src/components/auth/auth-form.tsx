"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { AuthState } from "@/app/[locale]/(auth)/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({
  action,
  submitLabel,
  successMessage,
  children,
}: {
  action: Action;
  submitLabel: string;
  successMessage?: string;
  children: ReactNode;
}) {
  const [state, formAction] = useFormState<AuthState, FormData>(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {children}
      <Submit label={submitLabel} />
      {state?.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state?.ok && successMessage ? (
        <p role="status" className="text-sm text-green-600">
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
