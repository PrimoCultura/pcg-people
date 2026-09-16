import Link from "next/link";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import { getPersonFullName, type Person } from "@/data/types";

type PersonTeamProps = {
  members: Person[];
};

export function PersonTeam({ members }: PersonTeamProps) {
  if (members.length === 0) return null;

  return (
    <section aria-labelledby="person-team-heading">
      <h2
        id="person-team-heading"
        className="text-xl font-semibold tracking-tight text-pcg-ink"
      >
        Team
      </h2>
      <ul className="mt-5 space-y-3">
        {members.map((member) => (
          <li key={member.id}>
            <Link
              href={`/persone/${member.id}`}
              className="group flex items-center gap-3 rounded-pcg-sm py-1"
            >
              <PersonAvatar person={member} size="sm" />
              <span className="min-w-0">
                <span className="block font-medium text-pcg-ink group-hover:text-pcg-primary">
                  {getPersonFullName(member)}
                </span>
                <span className="block truncate text-sm text-pcg-text-secondary">
                  {member.role}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
