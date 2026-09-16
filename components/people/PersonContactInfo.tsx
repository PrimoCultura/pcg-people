import type { Person } from "@/data/types";

type PersonContactInfoProps = {
  person: Person;
};

export function PersonContactInfo({ person }: PersonContactInfoProps) {
  return (
    <section aria-labelledby="person-contacts-heading">
      <h2
        id="person-contacts-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted"
      >
        Contatti
      </h2>
      <dl className="mt-4 space-y-4">
        <div>
          <dt className="text-sm text-pcg-text-muted">Email</dt>
          <dd className="mt-1">
            <a
              href={`mailto:${person.email}`}
              className="break-all text-base text-pcg-primary hover:text-pcg-primary-hover"
            >
              {person.email}
            </a>
          </dd>
        </div>
        {person.phone ? (
          <div>
            <dt className="text-sm text-pcg-text-muted">Telefono</dt>
            <dd className="mt-1">
              <a
                href={`tel:${person.phone.replace(/\s+/g, "")}`}
                className="text-base text-pcg-primary hover:text-pcg-primary-hover"
              >
                {person.phone}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
