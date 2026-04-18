import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export async function GET() {
  const lines: string[] = [`# ${site.name}`, "", site.description, "", "## Articles", ""];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) {
      lines.push(`- [${a.title}](${site.url}/${locale}/articles/${a.slug}): ${a.description}`);
    }
  }
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
