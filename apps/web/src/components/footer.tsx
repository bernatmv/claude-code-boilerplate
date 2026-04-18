import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <a href={site.author.url} rel="noreferrer" className="hover:text-foreground">
          {site.author.name}
        </a>
      </div>
    </footer>
  );
}
