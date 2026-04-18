import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

export interface ArticleFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
}

export interface ArticleSummary extends ArticleFrontmatter {
  slug: string;
  locale: string;
}

export interface Article extends ArticleSummary {
  content: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "articles");

function parse(raw: string): { data: ArticleFrontmatter; content: string } {
  const { data, content } = matter(raw);
  const d = data as Partial<ArticleFrontmatter>;
  if (!d.title || !d.description || !d.publishedAt || !d.author) {
    throw new Error("Article frontmatter missing required fields");
  }
  return {
    data: {
      title: d.title,
      description: d.description,
      publishedAt: d.publishedAt,
      updatedAt: d.updatedAt,
      author: d.author,
    },
    content,
  };
}

export async function listArticles(locale: string): Promise<ArticleSummary[]> {
  const dir = path.join(CONTENT_ROOT, locale);
  const files = await readdir(dir);
  const out: ArticleSummary[] = [];
  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data } = parse(raw);
    out.push({ slug, locale, ...data });
  }
  return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticle(locale: string, slug: string): Promise<Article | null> {
  try {
    const raw = await readFile(path.join(CONTENT_ROOT, locale, `${slug}.mdx`), "utf8");
    const { data, content } = parse(raw);
    return { slug, locale, content, ...data };
  } catch {
    return null;
  }
}
