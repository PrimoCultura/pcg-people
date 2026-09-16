import Link from "next/link";
import { siteConfig } from "@/config/site";

type SiteLogoProps = {
  className?: string;
};

/**
 * Wordmark: PCG (brand colors) + People — Montserrat via site font.
 */
export function SiteLogo({ className = "" }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-baseline gap-2 rounded-pcg-sm no-underline ${className}`}
      aria-label={`${siteConfig.appName} — home`}
    >
      <span
        className="text-[1.65rem] font-semibold leading-none tracking-tight sm:text-[1.85rem]"
        aria-hidden
      >
        <span className="text-pcg-primary">PC</span>
        <span className="text-[color:var(--pcg-logo-accent)]">G</span>
      </span>
      <span className="text-base font-semibold tracking-wide text-pcg-ink sm:text-lg">
        PEOPLE
      </span>
    </Link>
  );
}
