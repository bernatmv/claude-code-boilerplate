"use client";

import { useState, useTransition } from "react";

import { sendTestPush } from "@/app/[locale]/(protected)/settings/actions";

export function TestPushButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    setStatus(null);
    startTransition(async () => {
      const result = await sendTestPush();
      setStatus(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="self-start rounded-md border px-3 py-1 text-sm disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send test push"}
      </button>
      {status ? <p className="text-xs text-neutral-600 dark:text-neutral-400">{status}</p> : null}
    </div>
  );
}
