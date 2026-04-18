import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { articleSchema } from "@/lib/jsonld";
import { getArticle, listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) params.push({ locale, slug: a.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${site.url}/${locale}/articles/${slug}`,
    },
  };
}

export default async function ArticleDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 prose prose-slate dark:prose-invert">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              title: article.title,
              description: article.description,
              slug: article.slug,
              locale: article.locale,
              publishedAt: article.publishedAt,
              updatedAt: article.updatedAt,
              authorName: article.author,
            }),
          ),
        }}
      />
      <header>
        <h1>{article.title}</h1>
        <p className="lead">{article.description}</p>
        <time className="block text-sm text-muted-foreground">{article.publishedAt}</time>
      </header>
      <MDXRemote source={article.content} />
    </article>
  );
}
