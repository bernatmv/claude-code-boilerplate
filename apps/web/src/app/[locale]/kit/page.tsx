import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/auth/field";

export const dynamic = "force-static";

export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold">UI Kit</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Dev-only component gallery. Hidden in production builds.
        </p>
      </header>

      <Section title="Button variants">
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Button sizes">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Form fields">
        <form className="grid max-w-md gap-3">
          <Field label="Email" name="demo-email" type="email" required />
          <Field label="Password" name="demo-password" type="password" />
        </form>
      </Section>

      <Section title="Typography">
        <h2 className="text-2xl font-semibold">Heading 2</h2>
        <h3 className="text-xl font-semibold">Heading 3</h3>
        <p className="text-base">Body text.</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Muted text.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        {children}
      </div>
    </section>
  );
}
