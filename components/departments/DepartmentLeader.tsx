import Link from "next/link";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import { getPersonFullName, type Person } from "@/data/types";

type DepartmentLeaderProps = {
  head: Person;
};

export function DepartmentLeader({ head }: DepartmentLeaderProps) {
  return (
    <section aria-labelledby="department-leader-heading">
      <h2
        id="department-leader-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted"
      >
        Responsabile
      </h2>
      <Link
        href={`/persone/${head.id}`}
        className="group mt-4 inline-flex items-center gap-4 rounded-pcg-sm"
      >
        <PersonAvatar person={head} size="md" />
        <span className="min-w-0">
          <span className="block text-lg font-semibold text-pcg-ink group-hover:text-pcg-primary">
            {getPersonFullName(head)}
          </span>
          <span className="mt-0.5 block text-sm text-pcg-text-secondary">
            {head.role}
          </span>
        </span>
      </Link>
    </section>
  );
}
