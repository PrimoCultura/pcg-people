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
