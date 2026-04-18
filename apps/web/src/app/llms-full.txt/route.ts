import { readFile } from "node:fs/promises";
import path from "node:path";

import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export async function GET() {
  const chunks: string[] = [`# ${site.name}`, "", site.description, ""];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) {
      const raw = await readFile(
        path.join(process.cwd(), "content", "articles", locale, `${a.slug}.mdx`),
        "utf8",
      );
      chunks.push(`\n---\n\n# ${a.title} (${locale})\n\n> ${a.description}\n\n${raw}\n`);
    }
  }
  return new Response(chunks.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
