"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("global-error", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          padding: "6rem 1rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
          A critical error occurred. Please refresh the page.
        </p>
        {error.digest ? (
          <p style={{ marginTop: "1rem", fontFamily: "monospace", fontSize: "0.75rem" }}>
            ref: {error.digest}
          </p>
        ) : null}
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
