import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { organizationSchema, websiteSchema } from "@/lib/jsonld";

export default async function LandingPage() {
  const t = await getTranslations("common");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema(), websiteSchema()]),
        }}
      />
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("appName")}</h1>
        <p className="max-w-2xl text-muted-foreground">
          A full-stack starter that ships web + iOS + Android from one codebase.
        </p>
        <Button asChild size="lg">
          <Link href="/articles">{t("nav.home")} →</Link>
        </Button>
      </section>
    </>
  );
}
