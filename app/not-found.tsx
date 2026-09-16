import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <section className="pb-16 pt-14 sm:pb-20 sm:pt-16">
      <Container>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-pcg-primary">
          {siteConfig.organizationShortName}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-pcg-ink sm:text-4xl">
          Pagina non trovata
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-pcg-text-secondary">
          Il contenuto richiesto non esiste o non è più disponibile.
        </p>
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link
            href="/"
            className="rounded-pcg-sm font-medium text-pcg-primary hover:text-pcg-primary-hover"
          >
            Torna alla home
          </Link>
          <Link
            href="/persone"
            className="rounded-pcg-sm font-medium text-pcg-text-secondary hover:text-pcg-primary"
          >
            Vai alle persone
          </Link>
        </p>
      </Container>
    </section>
  );
}
