import { PersonAvatar } from "@/components/people/PersonAvatar";
import { getPersonFullName, type Person } from "@/data/types";
import { getPersonDepartmentLabel } from "@/lib/personLabels";

type PersonProfileHeaderProps = {
  person: Person;
};

export function PersonProfileHeader({ person }: PersonProfileHeaderProps) {
  const fullName = getPersonFullName(person);
  const departmentName = getPersonDepartmentLabel(person);

  return (
    <header className="flex flex-col gap-6 border-b border-pcg-border pb-8 sm:flex-row sm:items-start sm:gap-8 sm:pb-10">
      <PersonAvatar person={person} size="xl" />
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-pcg-text-muted">
          {person.type === "hq" ? "HQ" : "Network"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-pcg-ink sm:text-4xl">
          {fullName}
        </h1>
        <p className="mt-2 text-lg text-pcg-text-secondary">{person.role}</p>
        <p className="mt-3 text-sm text-pcg-text-muted">
          <span>{departmentName}</span>
          {person.location ? (
            <>
              <span className="mx-2 text-pcg-border-strong" aria-hidden>
                ·
              </span>
              <span>{person.location}</span>
            </>
          ) : null}
        </p>
      </div>
    </header>
  );
}
