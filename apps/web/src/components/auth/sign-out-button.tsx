import { signOutAction } from "@/app/[locale]/(auth)/actions";

export function SignOutButton({ label }: { label: string }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
      >
        {label}
      </button>
    </form>
  );
}
