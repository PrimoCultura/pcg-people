import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/layout/Container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-pcg-border bg-pcg-bg">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-pcg-text">
          {siteConfig.organizationName}
        </p>
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-pcg-text-secondary"
          aria-label="Link footer"
        >
          <Link
            href={siteConfig.footer.privacyHref}
            className="rounded-pcg-sm transition-colors hover:text-pcg-primary"
          >
            Privacy
          </Link>
          <Link
            href={siteConfig.footer.contactsHref}
            className="rounded-pcg-sm transition-colors hover:text-pcg-primary"
          >
            Contatti
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
