import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { siteConfig } from "@/config/site";

const exploreItems = [
  {
    href: "/persone",
    title: "Persone",
    description: "Trova colleghi, ruoli, responsabilità e recapiti.",
    Icon: PeopleIcon,
  },
  {
    href: "/dipartimenti",
    title: "Dipartimenti",
    description: "Scopri cosa fanno i team HQ e chi ne fa parte.",
    Icon: DepartmentsIcon,
  },
  {
    href: "/organizzazione",
    title: "Organigramma",
    description:
      "Esplora graficamente la struttura, i team e i rapporti organizzativi.",
    Icon: OrgIcon,
  },
  {
    href: "/network",
    title: "Network",
    description: "Consulta District, Area Manager e cliniche.",
    Icon: NetworkIcon,
  },
] as const;

export function ExploreSection() {
  return (
    <section
      className="bg-pcg-bg py-8 sm:py-10 lg:py-12"
      aria-labelledby="explore-heading"
    >
      <Container>
        <div className="mb-5 max-w-xl sm:mb-6">
          <h2
            id="explore-heading"
            className="text-xl font-semibold tracking-tight text-pcg-ink sm:text-2xl"
          >
            Esplora {siteConfig.organizationShortName}
          </h2>
          <p className="mt-1.5 text-sm text-pcg-text-secondary">
            Altri percorsi nell’organizzazione.
          </p>
        </div>

        <ul className="grid gap-0 border-t border-pcg-border sm:grid-cols-2">
          {exploreItems.map((item) => {
            const Icon = item.Icon;
            return (
              <li
                key={item.href}
                className="border-b border-pcg-border sm:odd:border-r"
              >
                <Link
                  href={item.href}
                  className="group flex h-full gap-3 px-1 py-4 transition-colors hover:bg-pcg-bg-subtle focus-visible:bg-pcg-bg-subtle sm:gap-4 sm:px-4 sm:py-5"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 text-pcg-primary transition-transform group-hover:-translate-y-px"
                  >
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-base font-semibold text-pcg-ink transition-colors group-hover:text-pcg-primary sm:text-lg">
                        {item.title}
                      </span>
                      <span
                        aria-hidden
                        className="text-pcg-primary transition-transform duration-200 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                    <span className="mt-1 block max-w-sm text-sm leading-relaxed text-pcg-text-secondary">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

function PeopleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 19c.6-3 2.8-4.5 5.5-4.5S14.4 16 15 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="17" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 14.5c2 .3 3.5 1.5 4 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DepartmentsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.75"
        y="3.75"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="13.25"
        y="3.75"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="3.75"
        y="13.25"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="13.25"
        y="13.25"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function OrgIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="8.25"
        y="2.75"
        width="7.5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 7.75V11M6.5 16.25V11h11v5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="2.75"
        y="16.25"
        width="7"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="14.25"
        y="16.25"
        width="7"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5.5" cy="18" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18.5" cy="18" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7.75v3.5M12 11.25 6.8 16M12 11.25l5.2 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
