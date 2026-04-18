import { site } from "./site";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    sameAs: [site.author.url],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  slug: string;
  locale: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
}

export function articleSchema(input: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: input.locale,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/${input.locale}/articles/${input.slug}`,
    },
  };
}
