import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  assertTeamHead,
  assertTeamParent,
  now,
  requireDepartment,
  requireTeam,
  slugify,
  userError,
} from "./lib/validators";
import { enrichPerson } from "./people";

type Ctx = QueryCtx | MutationCtx;

async function enrichTeam(ctx: Ctx, team: Doc<"teams">) {
  const department = await ctx.db.get(team.departmentId);
  const head = team.headId ? await ctx.db.get(team.headId) : null;
  const parentTeam = team.parentTeamId
    ? await ctx.db.get(team.parentTeamId)
    : null;
  const members = await ctx.db
    .query("people")
    .withIndex("by_team", (q) => q.eq("teamId", team._id))
    .collect();
  const activeMembers = members.filter((m) => m.active);

  return {
    ...team,
    departmentName: department?.name ?? "",
    headName: head ? `${head.firstName} ${head.lastName}` : null,
    headRole: head?.role ?? null,
    headDepartmentId: head?.departmentId ?? null,
    parentTeamName: parentTeam?.name ?? null,
    activeMemberCount: activeMembers.length,
  };
}

function sortTeams<T extends { order?: number; name: string }>(teams: T[]) {
  return teams.sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, "it");
  });
}

async function assertUniqueSlugInDepartment(
  ctx: Ctx,
  departmentId: Id<"departments">,
  slug: string,
  excludeId?: Id<"teams">,
) {
  const conflict = await ctx.db
    .query("teams")
    .withIndex("by_department_slug", (q) =>
      q.eq("departmentId", departmentId).eq("slug", slug),
    )
    .unique();
  if (conflict && conflict._id !== excludeId) {
    userError("Esiste già un Team con questo slug nel dipartimento.");
  }
}

async function handleDeactivationMembers(
  ctx: MutationCtx,
  team: Doc<"teams">,
  opts: {
    clearMemberTeams?: boolean;
    reassignMembersToTeamId?: Id<"teams">;
  },
) {
  const members = await ctx.db
    .query("people")
    .withIndex("by_team", (q) => q.eq("teamId", team._id))
    .collect();
  const activeMembers = members.filter((m) => m.active);
  if (activeMembers.length === 0) return;

  if (opts.reassignMembersToTeamId) {
    const target = await requireTeam(ctx, opts.reassignMembersToTeamId);
    if (target._id === team._id) {
      userError("Seleziona un Team di destinazione diverso.");
    }
    if (!target.active) {
      userError("Il Team di destinazione deve essere attivo.");
    }
    if (target.departmentId !== team.departmentId) {
      userError(
        "Il Team di destinazione deve appartenere allo stesso dipartimento.",
      );
    }
    const timestamp = now();
    for (const member of activeMembers) {
      await ctx.db.patch(member._id, {
        teamId: opts.reassignMembersToTeamId,
        updatedAt: timestamp,
      });
    }
    return;
  }

  if (opts.clearMemberTeams) {
    const timestamp = now();
    for (const member of activeMembers) {
      await ctx.db.patch(member._id, {
        teamId: undefined,
        updatedAt: timestamp,
      });
    }
    return;
  }

  userError(
    `Il Team ha ${activeMembers.length} membro/i attivi. Per disattivarlo conferma la rimozione dei membri dal Team oppure riassegnarli a un altro Team.`,
  );
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const enriched = await Promise.all(teams.map((t) => enrichTeam(ctx, t)));
    return sortTeams(enriched);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const enriched = await Promise.all(teams.map((t) => enrichTeam(ctx, t)));
    return sortTeams(enriched);
  },
});

export const listByDepartment = query({
  args: {
    departmentId: v.id("departments"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .collect();
    const filtered =
      args.activeOnly === false ? teams : teams.filter((t) => t.active);
    const enriched = await Promise.all(
      filtered.map((t) => enrichTeam(ctx, t)),
    );
    return sortTeams(enriched);
  },
});

export const getById = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.id);
    if (!team || !team.active) return null;
    const enriched = await enrichTeam(ctx, team);
    const members = await ctx.db
      .query("people")
      .withIndex("by_team", (q) => q.eq("teamId", args.id))
      .collect();
    const activeMembers = await Promise.all(
      members.filter((m) => m.active).map((m) => enrichPerson(ctx, m)),
    );
    const head = team.headId ? await ctx.db.get(team.headId) : null;
    return {
      ...enriched,
      head: head && head.active ? await enrichPerson(ctx, head) : null,
      members: activeMembers,
    };
  },
});

export const getByIdAdmin = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.id);
    if (!team) return null;
    return await enrichTeam(ctx, team);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    departmentId: v.id("departments"),
    headId: v.optional(v.id("people")),
    parentTeamId: v.optional(v.id("teams")),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireDepartment(ctx, args.departmentId);
    const slug = args.slug?.trim() || slugify(args.name);
    if (!slug) userError("Il nome del Team non produce uno slug valido.");
    await assertUniqueSlugInDepartment(ctx, args.departmentId, slug);
    await assertTeamHead(ctx, args.headId);
    await assertTeamParent(
      ctx,
      undefined,
      args.departmentId,
      args.parentTeamId,
    );

    let order = args.order;
    if (order === undefined) {
      const siblings = await ctx.db
        .query("teams")
        .withIndex("by_department", (q) =>
          q.eq("departmentId", args.departmentId),
        )
        .collect();
      const maxOrder = siblings.reduce(
        (max, t) =>
          typeof t.order === "number" && t.order > max ? t.order : max,
        0,
      );
      order = maxOrder + 1;
    }

    const timestamp = now();
    return await ctx.db.insert("teams", {
      name: args.name.trim(),
      slug,
      departmentId: args.departmentId,
      headId: args.headId,
      parentTeamId: args.parentTeamId,
      description: args.description?.trim() || undefined,
      order,
      active: args.active ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
    slug: v.string(),
    departmentId: v.id("departments"),
    headId: v.optional(v.id("people")),
    parentTeamId: v.optional(v.id("teams")),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.boolean(),
    clearMemberTeams: v.optional(v.boolean()),
    reassignMembersToTeamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const existing = await requireTeam(ctx, args.id);
    await requireDepartment(ctx, args.departmentId);
    const slug = args.slug.trim() || slugify(args.name);
    if (!slug) userError("Lo slug del Team non è valido.");
    await assertUniqueSlugInDepartment(ctx, args.departmentId, slug, args.id);
    await assertTeamHead(ctx, args.headId);
    await assertTeamParent(
      ctx,
      args.id,
      args.departmentId,
      args.parentTeamId,
    );

    if (args.departmentId !== existing.departmentId) {
      const members = await ctx.db
        .query("people")
        .withIndex("by_team", (q) => q.eq("teamId", args.id))
        .collect();
      const incompatible = members.filter(
        (m) => m.active && m.departmentId !== args.departmentId,
      );
      if (incompatible.length > 0) {
        userError(
          `Non puoi spostare il Team: ${incompatible.length} membro/i appartengono ancora al dipartimento precedente. Riassegna prima le persone.`,
        );
      }
    }

    if (existing.active && !args.active) {
      await handleDeactivationMembers(ctx, existing, {
        clearMemberTeams: args.clearMemberTeams,
        reassignMembersToTeamId: args.reassignMembersToTeamId,
      });
    }

    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      slug,
      departmentId: args.departmentId,
      headId: args.headId,
      parentTeamId: args.parentTeamId,
      description: args.description?.trim() || undefined,
      order: args.order,
      active: args.active,
      updatedAt: now(),
    });
  },
});

export const setActive = mutation({
  args: {
    id: v.id("teams"),
    active: v.boolean(),
    clearMemberTeams: v.optional(v.boolean()),
    reassignMembersToTeamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const team = await requireTeam(ctx, args.id);
    if (team.active === args.active) return;

    if (!args.active) {
      await handleDeactivationMembers(ctx, team, {
        clearMemberTeams: args.clearMemberTeams,
        reassignMembersToTeamId: args.reassignMembersToTeamId,
      });
    }

    await ctx.db.patch(args.id, {
      active: args.active,
      updatedAt: now(),
    });
  },
});
