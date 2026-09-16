import Link from "next/link";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import {
  getPersonFullName,
  getReportingType,
  type Person,
} from "@/data/types";
import { getPersonDepartmentLabel } from "@/lib/personLabels";

type PersonOrganizationProps = {
  person: Person;
  manager?: Person;
};

export function PersonOrganization({
  person,
  manager,
}: PersonOrganizationProps) {
  const departmentName = getPersonDepartmentLabel(person);
  const isStaff = Boolean(manager) && getReportingType(person) === "staff";

  return (
    <section aria-labelledby="person-org-heading">
      <h2
        id="person-org-heading"
        className="text-xl font-semibold tracking-tight text-pcg-ink"
      >
        Nell’organizzazione
      </h2>

      <dl className="mt-5 space-y-5">
        <div>
          <dt className="text-sm text-pcg-text-muted">Dipartimento</dt>
          <dd className="mt-1 text-base text-pcg-text">
            <Link
              href={`/dipartimenti/${person.departmentId}`}
              className="rounded-pcg-sm text-pcg-primary hover:text-pcg-primary-hover"
            >
              {departmentName}
            </Link>
          </dd>
        </div>

        {manager ? (
          <div>
            <dt className="text-sm text-pcg-text-muted">Responsabile diretto</dt>
            <dd className="mt-3">
              <Link
                href={`/persone/${manager.id}`}
                className="group inline-flex items-center gap-3 rounded-pcg-sm"
              >
                <PersonAvatar person={manager} size="sm" />
                <span className="min-w-0">
                  <span className="block font-medium text-pcg-ink group-hover:text-pcg-primary">
                    {getPersonFullName(manager)}
                  </span>
                  <span className="block text-sm text-pcg-text-secondary">
                    {manager.role}
                  </span>
                </span>
              </Link>
            </dd>
          </div>
        ) : null}

        {isStaff ? (
          <div>
            <dt className="text-sm text-pcg-text-muted">Collocazione</dt>
            <dd className="mt-1 text-base text-pcg-text">
              Staff del responsabile
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
