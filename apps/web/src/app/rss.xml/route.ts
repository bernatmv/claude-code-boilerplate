import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items: string[] = [];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) {
      const url = `${site.url}/${locale}/articles/${a.slug}`;
      items.push(
        [
          "<item>",
          `<title>${escape(a.title)}</title>`,
          `<link>${url}</link>`,
          `<guid>${url}</guid>`,
          `<description>${escape(a.description)}</description>`,
          `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>`,
          `<language>${locale}</language>`,
          "</item>",
        ].join(""),
      );
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${escape(site.name)}</title>
  <link>${site.url}</link>
  <description>${escape(site.description)}</description>
  ${items.join("\n  ")}
</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
