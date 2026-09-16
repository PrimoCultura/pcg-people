import { Container } from "@/components/layout/Container";

export function IntroSection() {
  return (
    <section
      className="border-t border-pcg-border bg-pcg-bg-subtle py-10 sm:py-12"
      aria-labelledby="intro-heading"
    >
      <Container>
        <div className="max-w-xl">
          <h2
            id="intro-heading"
            className="text-xl font-semibold tracking-tight text-pcg-ink sm:text-2xl"
          >
            Non sai chi cercare?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-pcg-text-secondary">
            Parti da ciò che ti serve. Cerca un’attività, un tema o un’esigenza
            e trova il riferimento corretto.
          </p>
          <p className="mt-5">
            <a
              href="#pcg-search"
              className="inline-flex items-center gap-1 rounded-pcg-sm text-sm font-medium text-pcg-primary transition-colors hover:text-pcg-primary-hover"
            >
              Cerca in PCG
              <span aria-hidden>→</span>
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
