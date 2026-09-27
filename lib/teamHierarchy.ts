import type { Team } from "@/data/team";
import type { Person } from "@/data/types";

export type TeamParentSource = "explicit" | "inferred" | "none";

export type TeamParentResolution = {
  /** Resolved parent team id, or null if top-level / unresolved. */
  parentTeamId: string | null;
  source: TeamParentSource;
  /** Admin / UI warning when config is inconsistent or ambiguous. */
  warning?: string;
};

/**
 * Resolve the superior team for nesting in department charts.
 * Explicit `parentTeamId` always wins. Otherwise infer from the head's
 * team membership when that points to exactly one other team in the same
 * department. Never invents people.managerId links.
 */
export function resolveTeamParent(
  team: Team,
  departmentTeams: Team[],
  peopleById: Map<string, Person>,
): TeamParentResolution {
  const byId = new Map(departmentTeams.map((t) => [t.id, t]));

  if (team.parentTeamId) {
    if (team.parentTeamId === team.id) {
      return {
        parentTeamId: null,
        source: "explicit",
        warning: "Un Team non può essere superiore di sé stesso.",
      };
    }
    const parent = byId.get(team.parentTeamId);
    if (!parent) {
      return {
        parentTeamId: null,
        source: "explicit",
        warning:
          "Il Team superiore configurato non è disponibile in questo dipartimento.",
      };
    }
    if (parent.departmentId !== team.departmentId) {
      return {
        parentTeamId: null,
        source: "explicit",
        warning: "Il Team superiore deve appartenere allo stesso dipartimento.",
      };
    }

    let warning: string | undefined;
    if (team.headId) {
      const head = peopleById.get(team.headId);
      if (
        head?.teamId &&
        head.teamId !== team.id &&
        head.teamId !== parent.id
      ) {
        const headTeam = byId.get(head.teamId);
        warning = headTeam
          ? `Il responsabile appartiene al Team «${headTeam.name}», diverso dal Team superiore configurato.`
          : "Il responsabile appartiene a un Team diverso dal Team superiore configurato.";
      }
    }

    return { parentTeamId: parent.id, source: "explicit", warning };
  }

  if (!team.headId) {
    return { parentTeamId: null, source: "none" };
  }

  const head = peopleById.get(team.headId);
  if (!head?.teamId || head.teamId === team.id) {
    return { parentTeamId: null, source: "none" };
  }

  const parent = byId.get(head.teamId);
  if (!parent) {
    return {
      parentTeamId: null,
      source: "none",
      warning:
        "Il responsabile appartiene a un Team fuori da questo dipartimento: imposta manualmente il Team superiore se serve l'annidamento.",
    };
  }

  if (parent.departmentId !== team.departmentId) {
    return {
      parentTeamId: null,
      source: "none",
      warning:
        "Il responsabile appartiene a un Team di un altro dipartimento: relazione non deducibile.",
    };
  }

  return { parentTeamId: parent.id, source: "inferred" };
}

/** Map team id → resolved parent team id (null = top-level). */
export function buildTeamParentMap(
  departmentTeams: Team[],
  peopleById: Map<string, Person>,
): Map<string, string | null> {
  const map = new Map<string, string | null>();
  for (const team of departmentTeams) {
    map.set(
      team.id,
      resolveTeamParent(team, departmentTeams, peopleById).parentTeamId,
    );
  }
  return map;
}

/** Child teams grouped by their resolved parent team id. */
export function buildChildTeamsByParent(
  departmentTeams: Team[],
  parentMap: Map<string, string | null>,
): Map<string, Team[]> {
  const map = new Map<string, Team[]>();
  for (const team of departmentTeams) {
    const parentId = parentMap.get(team.id);
    if (!parentId) continue;
    const list = map.get(parentId) ?? [];
    list.push(team);
    map.set(parentId, list);
  }
  for (const [, list] of map) {
    list.sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) ||
        a.name.localeCompare(b.name, "it"),
    );
  }
  return map;
}

export function topLevelTeams(
  departmentTeams: Team[],
  parentMap: Map<string, string | null>,
): Team[] {
  return departmentTeams
    .filter((t) => !parentMap.get(t.id))
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) ||
        a.name.localeCompare(b.name, "it"),
    );
}

/**
 * Teams that nest under a given person inside a parent team
 * (person is the nested team's head).
 */
export function nestedTeamsUnderPerson(
  personId: string,
  parentTeamId: string,
  childTeamsByParent: Map<string, Team[]>,
): Team[] {
  return (childTeamsByParent.get(parentTeamId) ?? []).filter(
    (t) => t.headId === personId,
  );
}

/** Collect ancestor ids walking parentMap (for cycle / UI exclusion). */
export function collectTeamAncestorIds(
  teamId: string,
  parentMap: Map<string, string | null>,
): Set<string> {
  const ancestors = new Set<string>();
  let current: string | null | undefined = parentMap.get(teamId);
  while (current) {
    if (ancestors.has(current)) break;
    ancestors.add(current);
    current = parentMap.get(current);
  }
  return ancestors;
}

/** Descendants of teamId in the resolved parent forest. */
export function collectTeamDescendantIds(
  teamId: string,
  childTeamsByParent: Map<string, Team[]>,
): Set<string> {
  const descendants = new Set<string>();
  const stack = [...(childTeamsByParent.get(teamId) ?? [])];
  while (stack.length > 0) {
    const next = stack.pop()!;
    if (descendants.has(next.id)) continue;
    descendants.add(next.id);
    for (const child of childTeamsByParent.get(next.id) ?? []) {
      stack.push(child);
    }
  }
  return descendants;
}
