import { PersonCard } from "@/components/people/PersonCard";
import type { Person } from "@/data/types";

type DepartmentTeamProps = {
  members: Person[];
};

export function DepartmentTeam({ members }: DepartmentTeamProps) {
  if (members.length === 0) return null;

  return (
    <section aria-labelledby="department-team-heading">
      <h2
        id="department-team-heading"
        className="text-xl font-semibold tracking-tight text-pcg-ink"
      >
        Il team
      </h2>
      <p className="mt-2 text-sm text-pcg-text-secondary">
        {members.length}{" "}
        {members.length === 1 ? "persona" : "persone"}
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {members.map((person) => (
          <li key={person.id}>
            <PersonCard person={person} />
          </li>
        ))}
      </ul>
    </section>
  );
}
