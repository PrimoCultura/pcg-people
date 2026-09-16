import Link from "next/link";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import type { Clinic } from "@/data/clinic";
import type { District } from "@/data/district";
import {
  getPersonFullName,
  isAreaManager,
  isDistrictManager,
  isNetworkHead,
  type Person,
} from "@/data/types";

type PersonNetworkInfoProps = {
  person: Person;
  reports: Person[];
  allPeople?: Person[];
  clinics?: Clinic[];
  allClinics?: Clinic[];
  districts?: District[];
};

export function PersonNetworkInfo({
  person,
  reports,
  allPeople = [],
  clinics = [],
  allClinics = [],
  districts = [],
}: PersonNetworkInfoProps) {
  const districtById = new Map(districts.map((d) => [d.id, d]));

  if (isNetworkHead(person)) {
    const districtManagers =
      allPeople.length > 0
        ? allPeople.filter(
            (p) => isDistrictManager(p) && p.managerId === person.id,
          )
        : reports.filter(isDistrictManager);

    if (districtManagers.length === 0) return null;

    return (
      <section aria-labelledby="person-network-heading">
        <h2
          id="person-network-heading"
          className="text-xl font-semibold tracking-tight text-pcg-ink"
        >
          Network
        </h2>
        <div className="mt-5">
          <p className="text-sm text-pcg-text-muted">District Manager</p>
          <ul className="mt-3 space-y-3">
            {districtManagers.map((manager) => (
              <li key={manager.id}>
                <PersonLink
                  person={manager}
                  subtitle={
                    manager.districtLabel ??
                    (manager.districtId
                      ? districtById.get(manager.districtId)?.name
                      : undefined) ??
                    manager.role
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (person.type !== "network" && !person.networkRole) return null;

  if (isDistrictManager(person) && person.districtId) {
    const district =
      districtById.get(person.districtId) ??
      (person.districtLabel
        ? { id: person.districtId, name: person.districtLabel, managerId: person.id }
        : undefined);
    const areaManagers =
      allPeople.length > 0
        ? allPeople.filter(
            (p) =>
              isAreaManager(p) && p.districtId === person.districtId,
          )
        : reports.filter(isAreaManager);
    const clinicCount = allClinics.filter(
      (c) => c.districtId === person.districtId,
    ).length;

    return (
      <section aria-labelledby="person-network-heading">
        <h2
          id="person-network-heading"
          className="text-xl font-semibold tracking-tight text-pcg-ink"
        >
          Network
        </h2>
        <div className="mt-5 space-y-6">
          {district ? (
            <div>
              <p className="text-sm text-pcg-text-muted">Distretto</p>
              <p className="mt-1">
                <Link
                  href={`/network/${district.id}`}
                  className="text-base text-pcg-primary hover:text-pcg-primary-hover"
                >
                  {district.name}
                </Link>
              </p>
              <p className="mt-2 text-sm text-pcg-text-secondary">
                {clinicCount}{" "}
                {clinicCount === 1 ? "clinica" : "cliniche"} nel distretto
              </p>
            </div>
          ) : null}

          {areaManagers.length > 0 ? (
            <div>
              <p className="text-sm text-pcg-text-muted">Area Manager</p>
              <ul className="mt-3 space-y-3">
                {areaManagers.map((manager) => {
                  const amClinics = allClinics.filter(
                    (c) => c.areaManagerId === manager.id,
                  );
                  return (
                    <li key={manager.id}>
                      <PersonLink
                        person={manager}
                        subtitle={`${amClinics.length} cliniche`}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (isAreaManager(person)) {
    const districtName =
      person.districtLabel ??
      (person.districtId
        ? districtById.get(person.districtId)?.name
        : undefined);
    const amClinics =
      clinics.length > 0
        ? clinics
        : allClinics.filter((c) => c.areaManagerId === person.id);

    if (!districtName && amClinics.length === 0) return null;

    return (
      <section aria-labelledby="person-network-heading">
        <h2
          id="person-network-heading"
          className="text-xl font-semibold tracking-tight text-pcg-ink"
        >
          Network
        </h2>
        <div className="mt-5 space-y-6">
          {districtName && person.districtId ? (
            <div>
              <p className="text-sm text-pcg-text-muted">Distretto</p>
              <p className="mt-1">
                <Link
                  href={`/network/${person.districtId}`}
                  className="text-base text-pcg-primary hover:text-pcg-primary-hover"
                >
                  {districtName}
                </Link>
              </p>
            </div>
          ) : null}

          {amClinics.length > 0 ? (
            <div>
              <p className="text-sm text-pcg-text-muted">Cliniche gestite</p>
              <ul className="mt-3 space-y-2">
                {amClinics.map((clinic) => (
                  <li
                    key={clinic.id}
                    className="border-b border-pcg-border/70 py-2 text-base text-pcg-text last:border-b-0"
                  >
                    {clinic.name}
                    <span className="text-pcg-text-muted"> · {clinic.city}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  const areaManagers = reports.filter(isAreaManager);
  if (areaManagers.length === 0) return null;

  return (
    <section aria-labelledby="person-network-heading">
      <h2
        id="person-network-heading"
        className="text-xl font-semibold tracking-tight text-pcg-ink"
      >
        Network
      </h2>
      <ul className="mt-5 space-y-3">
        {areaManagers.map((manager) => (
          <li key={manager.id}>
            <PersonLink person={manager} subtitle={manager.role} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PersonLink({
  person,
  subtitle,
}: {
  person: Person;
  subtitle: string;
}) {
  return (
    <Link
      href={`/persone/${person.id}`}
      className="group flex items-center gap-3 rounded-pcg-sm py-1"
    >
      <PersonAvatar person={person} size="sm" />
      <span className="min-w-0">
        <span className="block font-medium text-pcg-ink group-hover:text-pcg-primary">
          {getPersonFullName(person)}
        </span>
        <span className="block text-sm text-pcg-text-secondary">{subtitle}</span>
      </span>
    </Link>
  );
}
