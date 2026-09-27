"use client";

import { useState } from "react";
import Link from "next/link";
import { PersonCard } from "@/components/people/PersonCard";
import { getPersonFullName, type Person } from "@/data/types";
import type { Team } from "@/data/team";

export type DepartmentTeamGroup = Team & {
  head: Person | null;
  members: Person[];
  memberCount: number;
};

type DepartmentTeamsSectionProps = {
  teams: DepartmentTeamGroup[];
  unassignedMembers: Person[];
};

export function DepartmentTeamsSection({
  teams,
  unassignedMembers,
}: DepartmentTeamsSectionProps) {
  if (teams.length === 0 && unassignedMembers.length === 0) return null;

  return (
    <section aria-labelledby="department-teams-heading" className="space-y-10">
      {teams.length > 0 ? (
        <div>
          <h2
            id="department-teams-heading"
            className="text-xl font-semibold tracking-tight text-pcg-ink"
          >
            Team
          </h2>
          <p className="mt-2 text-sm text-pcg-text-secondary">
            {teams.length} {teams.length === 1 ? "team" : "team"} nel
            dipartimento
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <li key={team.id}>
                <TeamCard team={team} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {unassignedMembers.length > 0 ? (
        <div>
          <h2
            id="department-other-people-heading"
            className="text-xl font-semibold tracking-tight text-pcg-ink"
          >
            Altre persone del dipartimento
          </h2>
          <p className="mt-2 text-sm text-pcg-text-secondary">
            Persone senza Team assegnato · {unassignedMembers.length}{" "}
            {unassignedMembers.length === 1 ? "persona" : "persone"}
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {unassignedMembers.map((person) => (
              <li key={person.id}>
                <PersonCard person={person} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function TeamCard({ team }: { team: DepartmentTeamGroup }) {
  const [open, setOpen] = useState(false);
  const headName = team.head ? getPersonFullName(team.head) : null;

  return (
    <div className="rounded-pcg border border-pcg-border bg-pcg-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-pcg-text-muted">
            Team
          </p>
          <h3 className="mt-1 text-base font-semibold text-pcg-ink">
            {team.name}
          </h3>
          {team.description ? (
            <p className="mt-2 text-sm leading-relaxed text-pcg-text-secondary">
              {team.description}
            </p>
          ) : null}
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-pcg-text-muted">Responsabile</dt>
              <dd className="text-pcg-text">
                {team.head ? (
                  <Link
                    href={`/persone/${team.head.id}`}
                    className="text-pcg-primary hover:underline"
                  >
                    {headName}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-pcg-text-muted">Membri</dt>
              <dd className="text-pcg-text">{team.memberCount}</dd>
            </div>
          </dl>
        </div>
      </div>

      {team.members.length > 0 ? (
        <div className="mt-4 border-t border-pcg-border pt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-sm font-medium text-pcg-primary hover:underline"
            aria-expanded={open}
          >
            {open ? "Nascondi membri" : "Mostra membri"}
          </button>
          {open ? (
            <ul className="mt-3 grid gap-3">
              {team.members.map((person) => (
                <li key={person.id}>
                  <PersonCard person={person} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
