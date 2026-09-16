import Link from "next/link";
import { siteConfig } from "@/config/site";

export function AdminHeader() {
  return (
    <header className="border-b border-pcg-border bg-pcg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pcg-primary">
            {siteConfig.appName}
          </p>
          <h1 className="text-lg font-semibold text-pcg-ink">Admin</h1>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-pcg-primary hover:text-pcg-primary-hover"
        >
          ← Torna al sito
        </Link>
      </div>
    </header>
  );
}
