import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  assertClinicAreaManager,
  now,
  requireDistrict,
  slugify,
  userError,
} from "./lib/validators";
import { enrichPerson } from "./people";

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const clinics = await ctx.db
      .query("clinics")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return await Promise.all(
      clinics
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(async (clinic) => {
          const areaManager = await ctx.db.get(clinic.areaManagerId);
          const district = await ctx.db.get(clinic.districtId);
          const districtManager = district
            ? await ctx.db.get(district.managerId)
            : null;
          return {
            ...clinic,
            areaManager: areaManager
              ? await enrichPerson(ctx, areaManager)
              : null,
            districtName: district?.name ?? "",
            districtManager: districtManager
              ? await enrichPerson(ctx, districtManager)
              : null,
          };
        }),
    );
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const clinics = await ctx.db.query("clinics").collect();
    return clinics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

export const listByAreaManager = query({
  args: { areaManagerId: v.id("people") },
  handler: async (ctx, args) => {
    const clinics = await ctx.db
      .query("clinics")
      .withIndex("by_area_manager", (q) =>
        q.eq("areaManagerId", args.areaManagerId),
      )
      .collect();
    return clinics
      .filter((c) => c.active)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

export const getByIdAdmin = query({
  args: { id: v.id("clinics") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    city: v.string(),
    region: v.optional(v.string()),
    address: v.optional(v.string()),
    districtId: v.id("districts"),
    areaManagerId: v.id("people"),
    active: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireDistrict(ctx, args.districtId);
    await assertClinicAreaManager(ctx, args.areaManagerId, args.districtId);
    const slug = args.slug?.trim() || slugify(`${args.name}-${args.city}`);
    const existing = await ctx.db
      .query("clinics")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) userError("Esiste già una clinica con questo slug.");
    const timestamp = now();
    return await ctx.db.insert("clinics", {
      name: args.name,
      slug,
      city: args.city,
      region: args.region,
      address: args.address,
      districtId: args.districtId,
      areaManagerId: args.areaManagerId,
      active: args.active ?? true,
      order: args.order,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clinics"),
    name: v.string(),
    slug: v.string(),
    city: v.string(),
    region: v.optional(v.string()),
    address: v.optional(v.string()),
    districtId: v.id("districts"),
    areaManagerId: v.id("people"),
    active: v.boolean(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clinic = await ctx.db.get(args.id);
    if (!clinic) userError("Clinica non trovata.");
    await requireDistrict(ctx, args.districtId);
    await assertClinicAreaManager(ctx, args.areaManagerId, args.districtId);
    const conflict = await ctx.db
      .query("clinics")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (conflict && conflict._id !== args.id) {
      userError("Esiste già una clinica con questo slug.");
    }
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: now() });
  },
});

export const setActive = mutation({
  args: { id: v.id("clinics"), active: v.boolean() },
  handler: async (ctx, args) => {
    const clinic = await ctx.db.get(args.id);
    if (!clinic) userError("Clinica non trovata.");
    await ctx.db.patch(args.id, { active: args.active, updatedAt: now() });
  },
});
