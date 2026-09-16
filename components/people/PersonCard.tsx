import Link from "next/link";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import { getPersonFullName, type Person } from "@/data/types";
import { getPersonDepartmentLabel } from "@/lib/personLabels";

type PersonCardProps = {
  person: Person;
};

export function PersonCard({ person }: PersonCardProps) {
  const fullName = getPersonFullName(person);
  const helpLine = person.canHelpWith.slice(0, 3).join(", ");
  const departmentName = getPersonDepartmentLabel(person);

  return (
    <Link
      href={`/persone/${person.id}`}
      className="group flex h-full flex-col gap-4 rounded-pcg border border-pcg-border bg-pcg-bg p-5 transition-colors hover:border-pcg-border-strong hover:bg-pcg-bg-subtle focus-visible:border-pcg-primary"
    >
      <div className="flex gap-4">
        <PersonAvatar person={person} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-pcg-ink group-hover:text-pcg-primary">
            {fullName}
          </p>
          <p className="mt-0.5 truncate text-sm text-pcg-text-secondary">
            {person.role}
          </p>
          <p className="mt-1 truncate text-xs font-medium uppercase tracking-wider text-pcg-text-muted">
            {departmentName}
            <span className="mx-1.5 text-pcg-border-strong" aria-hidden>
              ·
            </span>
            {person.type === "hq" ? "HQ" : "Network"}
          </p>
        </div>
      </div>

      {helpLine ? (
        <p className="text-sm leading-relaxed text-pcg-text-secondary">
          <span className="text-pcg-text-muted">Puoi rivolgerti a me per </span>
          {helpLine}
        </p>
      ) : null}

      <p className="mt-auto truncate text-xs text-pcg-text-muted">
        {person.email}
      </p>
    </Link>
  );
}
