import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export function userError(message: string): never {
  throw new ConvexError({ code: "USER_ERROR", message });
}

export async function requirePerson(
  ctx: Ctx,
  id: Id<"people">,
): Promise<Doc<"people">> {
  const person = await ctx.db.get(id);
  if (!person) userError("Persona non trovata.");
  return person;
}

export async function requireDepartment(
  ctx: Ctx,
  id: Id<"departments">,
): Promise<Doc<"departments">> {
  const department = await ctx.db.get(id);
  if (!department) userError("Dipartimento non trovato.");
  return department;
}

export async function requireTeam(
  ctx: Ctx,
  id: Id<"teams">,
): Promise<Doc<"teams">> {
  const team = await ctx.db.get(id);
  if (!team) userError("Team non trovato.");
  return team;
}

/**
 * Ensures teamId (if set) exists, is active when required, and belongs to
 * the person's department. Does not mutate managerId.
 */
export async function assertTeamAssignment(
  ctx: Ctx,
  departmentId: Id<"departments">,
  teamId: Id<"teams"> | undefined,
  opts?: { requireActive?: boolean },
) {
  if (!teamId) return;
  const team = await requireTeam(ctx, teamId);
  if (team.departmentId !== departmentId) {
    userError(
      "Il Team selezionato non appartiene al dipartimento della persona.",
    );
  }
  if (opts?.requireActive !== false && !team.active) {
    userError("Il Team selezionato non è attivo.");
  }
}

export async function assertTeamHead(
  ctx: Ctx,
  headId: Id<"people"> | undefined,
) {
  if (!headId) return;
  const head = await requirePerson(ctx, headId);
  if (!head.active) {
    userError("Il responsabile del Team deve essere una persona attiva.");
  }
}

/**
 * Validates optional parentTeamId: same department, not self, no cycles.
 * Does not mutate people.managerId.
 */
export async function assertTeamParent(
  ctx: Ctx,
  teamId: Id<"teams"> | undefined,
  departmentId: Id<"departments">,
  parentTeamId: Id<"teams"> | undefined,
) {
  if (!parentTeamId) return;

  if (teamId && parentTeamId === teamId) {
    userError("Un Team non può essere superiore di sé stesso.");
  }

  const parent = await requireTeam(ctx, parentTeamId);
  if (parent.departmentId !== departmentId) {
    userError(
      "Il Team superiore deve appartenere allo stesso dipartimento.",
    );
  }

  // Walk ancestors of the chosen parent; if we hit teamId, nesting would cycle.
  if (teamId) {
    let currentId: Id<"teams"> | undefined = parentTeamId;
    const visited = new Set<string>();
    while (currentId) {
      if (currentId === teamId) {
        userError(
          "Non è possibile impostare questo Team superiore: creerebbe un ciclo.",
        );
      }
      if (visited.has(currentId)) {
        userError(
          "Non è possibile impostare questo Team superiore: gerarchia circolare rilevata.",
        );
      }
      visited.add(currentId);
      const current: Doc<"teams"> | null = await ctx.db.get(currentId);
      if (!current) break;
      currentId = current.parentTeamId;
    }
  }
}

export async function requireDistrict(
  ctx: Ctx,
  id: Id<"districts">,
): Promise<Doc<"districts">> {
  const district = await ctx.db.get(id);
  if (!district) userError("Distretto non trovato.");
  return district;
}

/**
 * Walks the manager chain starting from candidateManagerId.
 * Returns true if personId appears in that chain (would form a cycle).
 */
export async function wouldCreateManagerCycle(
  ctx: Ctx,
  personId: Id<"people">,
  candidateManagerId: Id<"people">,
): Promise<boolean> {
  if (personId === candidateManagerId) return true;

  let currentId: Id<"people"> | undefined = candidateManagerId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === personId) return true;
    if (visited.has(currentId)) {
      // Existing cycle in data — treat as unsafe
      return true;
    }
    visited.add(currentId);
    const current: Doc<"people"> | null = await ctx.db.get(currentId);
    if (!current) break;
    currentId = current.managerId;
  }

  return false;
}

export async function assertManagerAssignment(
  ctx: Ctx,
  personId: Id<"people"> | null,
  managerId: Id<"people"> | undefined,
) {
  if (!managerId) return;
  const manager = await requirePerson(ctx, managerId);
  if (!manager.active) {
    userError("Il responsabile selezionato non è attivo.");
  }
  if (personId && (await wouldCreateManagerCycle(ctx, personId, managerId))) {
    userError(
      "Non è possibile assegnare questo responsabile perché creerebbe un ciclo gerarchico.",
    );
  }
}

export async function assertDepartmentHead(
  ctx: Ctx,
  headId: Id<"people"> | undefined,
) {
  if (!headId) return;
  const head = await requirePerson(ctx, headId);
  if (!head.active) {
    userError("Il responsabile del dipartimento deve essere una persona attiva.");
  }
}

export async function assertDistrictManager(
  ctx: Ctx,
  managerId: Id<"people">,
) {
  const manager = await requirePerson(ctx, managerId);
  if (!manager.active) {
    userError("Il District Manager deve essere una persona attiva.");
  }
  if (manager.networkRole !== "district-manager") {
    userError(
      "Il responsabile del distretto deve avere ruolo Network «district-manager».",
    );
  }
}

export async function assertClinicAreaManager(
  ctx: Ctx,
  areaManagerId: Id<"people">,
  districtId: Id<"districts">,
) {
  const am = await requirePerson(ctx, areaManagerId);
  if (!am.active) {
    userError("L’Area Manager deve essere una persona attiva.");
  }
  if (am.networkRole !== "area-manager") {
    userError(
      "La clinica può essere assegnata solo a una persona con ruolo «area-manager».",
    );
  }
  if (am.districtId !== districtId) {
    userError(
      "L’Area Manager selezionato non appartiene al distretto della clinica.",
    );
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function now() {
  return Date.now();
}
