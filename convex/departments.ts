import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
    return departments
      .filter((d) => typeof d.order === "number" && d.slug !== "network")
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
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
    return await ctx.db.insert("departments", {
      name: args.name,
      slug,
      shortDescription: args.shortDescription,
      description: args.description,
      headId: args.headId,
      contactFor: args.contactFor,
      tags: args.tags,
      order: args.order,
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
