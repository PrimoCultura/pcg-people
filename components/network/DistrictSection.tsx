import Link from "next/link";
import { AreaManagerBlock } from "@/components/network/AreaManagerBlock";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import type { Clinic } from "@/data/clinic";
import type { District } from "@/data/district";
import { getPersonFullName, type Person } from "@/data/types";

export type DistrictSectionData = District & {
  manager: Person | null;
  areaManagers: Array<Person & { clinics: Clinic[] }>;
  clinicCount: number;
};

type DistrictSectionProps = {
  district: DistrictSectionData;
};

export function DistrictSection({ district }: DistrictSectionProps) {
  const { manager, areaManagers, clinicCount } = district;

  return (
    <section
      className="border-t border-pcg-border py-10 first:border-t-0 first:pt-0 sm:py-12"
      aria-labelledby={`district-${district.id}-heading`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h2
          id={`district-${district.id}-heading`}
          className="text-2xl font-semibold tracking-tight text-pcg-ink"
        >
          <Link
            href={`/network/${district.id}`}
            className="rounded-pcg-sm hover:text-pcg-primary"
          >
            {district.name}
          </Link>
        </h2>
        <p className="text-sm text-pcg-text-muted">
          {areaManagers.length} Area Manager · {clinicCount} cliniche
        </p>
      </div>

      {manager ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
            District Manager
          </p>
          <Link
            href={`/persone/${manager.id}`}
            className="group mt-3 inline-flex items-center gap-3 rounded-pcg-sm"
          >
            <PersonAvatar person={manager} size="md" />
            <span className="min-w-0">
              <span className="block font-semibold text-pcg-ink group-hover:text-pcg-primary">
                {getPersonFullName(manager)}
              </span>
              <span className="block text-sm text-pcg-text-secondary">
                {manager.role}
              </span>
            </span>
          </Link>
        </div>
      ) : null}

      {areaManagers.length > 0 ? (
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
            Area Manager
          </p>
          <div className="border-t border-pcg-border">
            {areaManagers.map((person) => (
              <AreaManagerBlock
                key={person.id}
                person={person}
                clinics={person.clinics}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
