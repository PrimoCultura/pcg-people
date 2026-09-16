import Link from "next/link";
import { ClinicList } from "@/components/network/ClinicList";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import type { Clinic } from "@/data/clinic";
import { getPersonFullName, type Person } from "@/data/types";

type AreaManagerBlockProps = {
  person: Person;
  clinics: Clinic[];
};

export function AreaManagerBlock({ person, clinics }: AreaManagerBlockProps) {
  return (
    <article className="border-t border-pcg-border py-6 first:border-t-0 first:pt-0">
      <Link
        href={`/persone/${person.id}`}
        className="group inline-flex items-center gap-3 rounded-pcg-sm"
      >
        <PersonAvatar person={person} size="sm" />
        <span className="min-w-0">
          <span className="block font-semibold text-pcg-ink group-hover:text-pcg-primary">
            {getPersonFullName(person)}
          </span>
          <span className="block text-sm text-pcg-text-secondary">
            {person.role}
          </span>
        </span>
      </Link>

      <p className="mt-3 text-sm text-pcg-text-muted">
        {clinics.length} {clinics.length === 1 ? "clinica" : "cliniche"}
      </p>

      <ClinicList clinics={clinics} />
    </article>
  );
}
