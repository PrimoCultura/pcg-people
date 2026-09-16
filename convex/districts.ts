import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  assertDistrictManager,
  now,
  requireDistrict,
  slugify,
  userError,
} from "./lib/validators";
import { enrichPerson } from "./people";

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const districts = await ctx.db
      .query("districts")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const sorted = districts.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return await Promise.all(
      sorted.map(async (district) => {
        const manager = await ctx.db.get(district.managerId);
        const clinics = await ctx.db
          .query("clinics")
          .withIndex("by_district", (q) => q.eq("districtId", district._id))
          .collect();
        const activeClinics = clinics.filter((c) => c.active);
        const areaManagers = (
          await ctx.db
            .query("people")
            .withIndex("by_district", (q) => q.eq("districtId", district._id))
            .collect()
        ).filter((p) => p.active && p.networkRole === "area-manager");

        return {
          ...district,
          manager: manager ? await enrichPerson(ctx, manager) : null,
          clinicCount: activeClinics.length,
          areaManagers: await Promise.all(
            areaManagers.map(async (p) => ({
              ...(await enrichPerson(ctx, p)),
              clinics: activeClinics
                .filter((c) => c.areaManagerId === p._id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
            })),
          ),
        };
      }),
    );
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const districts = await ctx.db.query("districts").collect();
    return districts.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  },
});

export const getById = query({
  args: { id: v.id("districts") },
  handler: async (ctx, args) => {
    const district = await ctx.db.get(args.id);
    if (!district || !district.active) return null;
    const manager = await ctx.db.get(district.managerId);
    const areaManagers = (
      await ctx.db
        .query("people")
        .withIndex("by_district", (q) => q.eq("districtId", district._id))
        .collect()
    ).filter((p) => p.active && p.networkRole === "area-manager");

    const clinics = await ctx.db
      .query("clinics")
      .withIndex("by_district", (q) => q.eq("districtId", district._id))
      .collect();

    return {
      ...district,
      manager: manager && manager.active ? await enrichPerson(ctx, manager) : null,
      areaManagers: await Promise.all(
        areaManagers.map(async (am) => {
          const amClinics = clinics.filter(
            (c) => c.active && c.areaManagerId === am._id,
          );
          return {
            ...(await enrichPerson(ctx, am)),
            clinics: amClinics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
          };
        }),
      ),
      clinicCount: clinics.filter((c) => c.active).length,
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const district = await ctx.db
      .query("districts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!district || !district.active) return null;
    return district;
  },
});

export const getByIdAdmin = query({
  args: { id: v.id("districts") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    shortName: v.optional(v.string()),
    managerId: v.id("people"),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const slug = args.slug?.trim() || slugify(args.name);
    const existing = await ctx.db
      .query("districts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) userError("Esiste già un distretto con questo slug.");
    await assertDistrictManager(ctx, args.managerId);
    const timestamp = now();
    return await ctx.db.insert("districts", {
      name: args.name,
      slug,
      shortName: args.shortName,
      managerId: args.managerId,
      description: args.description,
      order: args.order,
      active: args.active ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("districts"),
    name: v.string(),
    slug: v.string(),
    shortName: v.optional(v.string()),
    managerId: v.id("people"),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireDistrict(ctx, args.id);
    const conflict = await ctx.db
      .query("districts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (conflict && conflict._id !== args.id) {
      userError("Esiste già un distretto con questo slug.");
    }
    await assertDistrictManager(ctx, args.managerId);
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: now() });
  },
});

export const setActive = mutation({
  args: { id: v.id("districts"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireDistrict(ctx, args.id);
    await ctx.db.patch(args.id, { active: args.active, updatedAt: now() });
  },
});
