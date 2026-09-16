import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import { OrgChartCta } from "@/components/home/OrgChartCta";
import { Container } from "@/components/layout/Container";
import type { Person } from "@/data/types";

type HomeHeroProps = {
  people: Person[];
};

export function HomeHero({ people }: HomeHeroProps) {
  return (
    <section className="border-b border-pcg-border bg-pcg-bg">
      <Container className="pb-8 pt-6 sm:pb-9 sm:pt-8 lg:pt-9">
        <div className="max-w-2xl">
          <p className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-pcg-primary">
            Persone · Ruoli · Contatti
          </p>
          <h1 className="text-[clamp(1.75rem,3.8vw,2.75rem)] font-semibold leading-[1.12] tracking-tight text-pcg-ink">
            Le persone di PCG
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-pcg-text-secondary">
            Scopri chi siamo, cosa facciamo e come siamo organizzati.
          </p>
        </div>

        <div className="mt-7 grid gap-8 lg:mt-8 lg:grid-cols-2 lg:gap-0">
          {/* Search — left */}
          <div className="min-w-0 lg:pr-10 xl:pr-12">
            <h2 className="text-xl font-semibold tracking-tight text-pcg-ink sm:text-[1.35rem]">
              Cerca una persona
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-pcg-text-secondary">
              Trova rapidamente colleghi, ruoli, attività e riferimenti.
            </p>
            <div className="mt-5">
              <HomeHeroSearch people={people} />
            </div>
          </div>

          {/* Org chart — right */}
          <div className="min-w-0 border-t border-pcg-border pt-8 lg:border-l lg:border-t-0 lg:bg-pcg-bg-subtle/40 lg:pl-10 lg:pt-0 xl:pl-12">
            <OrgChartCta />
          </div>
        </div>
      </Container>
    </section>
  );
}
