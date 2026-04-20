"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("route error boundary caught error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        An unexpected error occurred. You can try again or return to the homepage.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">ref: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </section>
  );
}
