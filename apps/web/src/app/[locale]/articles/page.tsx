import type { Metadata } from "next";

import { Link } from "@/navigation";
import { listArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function ArticlesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const articles = await listArticles(locale);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Articles</h1>
      <ul className="mt-8 space-y-6">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/articles/${a.slug}`}
              className="group block rounded-lg border border-border p-4 transition-colors hover:bg-muted"
            >
              <h2 className="text-xl font-semibold group-hover:underline">{a.title}</h2>
              <p className="mt-1 text-muted-foreground">{a.description}</p>
              <time className="mt-2 block text-xs text-muted-foreground">{a.publishedAt}</time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
