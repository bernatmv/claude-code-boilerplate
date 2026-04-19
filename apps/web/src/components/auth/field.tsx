import { cn } from "@/lib/cn";

export function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      <span className="text-neutral-700 dark:text-neutral-300">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  );
}
