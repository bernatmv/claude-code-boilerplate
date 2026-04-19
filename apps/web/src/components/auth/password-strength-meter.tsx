"use client";

import { useMemo, useState } from "react";
import { estimatePasswordStrength } from "@repo/validation";

import { cn } from "@/lib/cn";

const COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-600"];

export function PasswordStrengthField({
  label,
  name,
  autoComplete = "new-password",
}: {
  label: string;
  name: string;
  autoComplete?: string;
}) {
  const [value, setValue] = useState("");
  const strength = useMemo(() => estimatePasswordStrength(value), [value]);
  const barColor = COLORS[strength.score] ?? COLORS[0];

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
      <input
        name={name}
        type="password"
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
      {value.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          <div className="flex h-1.5 gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full",
                  i <= strength.score ? barColor : "bg-neutral-200 dark:bg-neutral-800",
                )}
              />
            ))}
          </div>
          <span className="text-xs capitalize text-neutral-600 dark:text-neutral-400">
            {strength.label}
            {strength.warnings[0] ? ` — ${strength.warnings[0]}` : ""}
          </span>
        </div>
      )}
    </label>
  );
}
