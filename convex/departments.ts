import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { organizationalPlacement } from "./lib/enums";
import {
  assertDepartmentHead,
  now,
  requireDepartment,
  slugify,
  userError,
} from "./lib/validators";
import { enrichPerson } from "./people";

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const departments = await ctx.db
      .query("departments")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return departments.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  },
});

export const listHq = query({
  args: {},
  handler: async (ctx) => {
    const departments = await ctx.db
      .query("departments")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    // All active departments except the special Network bucket.
    // Order is optional — missing order sorts last (by name as tiebreaker).
    return departments
      .filter((d) => d.slug !== "network")
      .sort((a, b) => {
        const ao = a.order ?? Number.POSITIVE_INFINITY;
        const bo = b.order ?? Number.POSITIVE_INFINITY;
        if (ao !== bo) return ao - bo;
        return a.name.localeCompare(b.name, "it");
      });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const departments = await ctx.db.query("departments").collect();
    return departments.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  },
});

export const getById = query({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.id);
    if (!department || !department.active) return null;
    const head = department.headId
      ? await ctx.db.get(department.headId)
      : null;
    const members = await ctx.db
      .query("people")
      .withIndex("by_department", (q) => q.eq("departmentId", args.id))
      .collect();
    const activeMembers = await Promise.all(
      members
        .filter((m) => m.active && m._id !== department.headId)
        .map((m) => enrichPerson(ctx, m)),
    );
    return {
      ...department,
      head: head && head.active ? await enrichPerson(ctx, head) : null,
      members: activeMembers,
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const department = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!department || !department.active) return null;
    return await ctx.db.get(department._id);
  },
});

export const getByIdAdmin = query({
  args: { id: v.id("departments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    shortDescription: v.string(),
    description: v.string(),
    headId: v.optional(v.id("people")),
    contactFor: v.array(v.string()),
    tags: v.array(v.string()),
    order: v.optional(v.number()),
    organizationalPlacement: v.optional(organizationalPlacement),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const slug = args.slug?.trim() || slugify(args.name);
    const existing = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) userError("Esiste già un dipartimento con questo slug.");
    await assertDepartmentHead(ctx, args.headId);
    const timestamp = now();
    let order = args.order;
    if (order === undefined) {
      const all = await ctx.db.query("departments").collect();
      const maxOrder = all.reduce(
        (max, d) =>
          typeof d.order === "number" && d.order > max ? d.order : max,
        0,
      );
      order = maxOrder + 1;
    }
    return await ctx.db.insert("departments", {
      name: args.name,
      slug,
      shortDescription: args.shortDescription,
      description: args.description,
      headId: args.headId,
      contactFor: args.contactFor,
      tags: args.tags,
      order,
      organizationalPlacement: args.organizationalPlacement,
      active: args.active ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("departments"),
    name: v.string(),
    slug: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    headId: v.optional(v.id("people")),
    contactFor: v.array(v.string()),
    tags: v.array(v.string()),
    order: v.optional(v.number()),
    organizationalPlacement: v.optional(organizationalPlacement),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireDepartment(ctx, args.id);
    const conflict = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (conflict && conflict._id !== args.id) {
      userError("Esiste già un dipartimento con questo slug.");
    }
    await assertDepartmentHead(ctx, args.headId);
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: now() });
  },
});

export const setActive = mutation({
  args: { id: v.id("departments"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireDepartment(ctx, args.id);
    await ctx.db.patch(args.id, { active: args.active, updatedAt: now() });
  },
});

/**
 * Ensure a CEO department exists (for the departments org view root).
 * Idempotent — skips if slug «ceo» is already present.
 */
export const ensureCeoDepartment = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", "ceo"))
      .unique();
    if (existing) {
      return { created: false, id: existing._id };
    }

    const roots = (
      await ctx.db
        .query("people")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect()
    ).filter((p) => p.isOrgRoot === true && !p.managerId);
    const root = roots[0];
    const timestamp = now();
    const id = await ctx.db.insert("departments", {
      name: "CEO",
      slug: "ceo",
      shortDescription: "Vertice e direzione generale del gruppo.",
      description:
        "La funzione CEO rappresenta il vertice aziendale: indirizzo strategico, governance e coordinamento delle direzioni.",
      headId: root?._id,
      contactFor: ["direzione generale", "governance", "priorità strategiche"],
      tags: ["ceo", "direzione"],
      order: 0,
      organizationalPlacement: "line",
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return { created: true, id };
  },
});

/**
 * One-shot repair: mark Cultura as staff and point its head to the org root
 * when missing/wrong — keeps the Staff AD → Cultura container working.
 */
export const repairStaffPlacements = mutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = now();
    const roots = (
      await ctx.db
        .query("people")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect()
    ).filter((p) => p.isOrgRoot === true && !p.managerId);

    const root = roots[0];
    const cultura = await ctx.db
      .query("departments")
      .withIndex("by_slug", (q) => q.eq("slug", "cultura"))
      .unique();

    const patched: string[] = [];
    if (cultura) {
      const patch: {
        organizationalPlacement: "staff";
        updatedAt: number;
        headId?: typeof cultura.headId;
      } = {
        organizationalPlacement: "staff",
        updatedAt: timestamp,
      };
      if (root && cultura.headId !== root._id) {
        patch.headId = root._id;
      }
      await ctx.db.patch(cultura._id, patch);
      patched.push("cultura");
    }

    return { patched, rootId: root?._id ?? null };
  },
});
