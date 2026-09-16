import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  assertManagerAssignment,
  now,
  requireDepartment,
  requirePerson,
  userError,
} from "./lib/validators";
import { networkRole, personType, reportingType } from "./lib/enums";

async function photoUrlFor(
  ctx: { storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> } },
  storageId: Id<"_storage"> | undefined,
) {
  if (!storageId) return null;
  return await ctx.storage.getUrl(storageId);
}

export async function enrichPerson(
  ctx: {
    db: {
      get: <TableName extends "departments" | "people" | "districts">(
        id: Id<TableName>,
      ) => Promise<Doc<TableName> | null>;
    };
    storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> };
  },
  person: Doc<"people">,
) {
  const department = await ctx.db.get(person.departmentId);
  const manager = person.managerId
    ? await ctx.db.get(person.managerId)
    : null;
  const district = person.districtId
    ? await ctx.db.get(person.districtId)
    : null;
  const photoUrl = await photoUrlFor(ctx, person.photoStorageId);

  return {
    ...person,
    departmentName: department?.name ?? "",
    managerName: manager
      ? `${manager.firstName} ${manager.lastName}`
      : null,
    managerRole: manager?.role ?? null,
    districtName: district?.name ?? null,
    photoUrl,
  };
}

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const people = await ctx.db
      .query("people")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return await Promise.all(people.map((p) => enrichPerson(ctx, p)));
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const people = await ctx.db.query("people").collect();
    return await Promise.all(people.map((p) => enrichPerson(ctx, p)));
  },
});

export const getById = query({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.id);
    if (!person || !person.active) return null;
    return await enrichPerson(ctx, person);
  },
});

export const getByIdAdmin = query({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.id);
    if (!person) return null;
    return await enrichPerson(ctx, person);
  },
});

export const listDirectReports = query({
  args: { managerId: v.id("people") },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("people")
      .withIndex("by_manager", (q) => q.eq("managerId", args.managerId))
      .collect();
    return await Promise.all(
      reports.filter((p) => p.active).map((p) => enrichPerson(ctx, p)),
    );
  },
});

export const listByDepartment = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const people = await ctx.db
      .query("people")
      .withIndex("by_department", (q) => q.eq("departmentId", args.departmentId))
      .collect();
    return await Promise.all(
      people.filter((p) => p.active).map((p) => enrichPerson(ctx, p)),
    );
  },
});

const personFields = {
  firstName: v.string(),
  lastName: v.string(),
  role: v.string(),
  departmentId: v.id("departments"),
  managerId: v.optional(v.id("people")),
  reportingType: v.optional(reportingType),
  type: personType,
  networkRole: v.optional(networkRole),
  districtId: v.optional(v.id("districts")),
  email: v.string(),
  phone: v.optional(v.string()),
  location: v.optional(v.string()),
  shortDescription: v.optional(v.string()),
  responsibilities: v.array(v.string()),
  tags: v.array(v.string()),
  active: v.optional(v.boolean()),
  isOrgRoot: v.optional(v.boolean()),
  sortOrder: v.optional(v.number()),
};

export const create = mutation({
  args: personFields,
  handler: async (ctx, args) => {
    await requireDepartment(ctx, args.departmentId);
    await assertManagerAssignment(ctx, null, args.managerId);

    if (args.districtId) {
      const district = await ctx.db.get(args.districtId);
      if (!district) userError("Distretto non trovato.");
    }

    if (!args.managerId && !args.isOrgRoot) {
      // Allowed, but incomplete — admin diagnostics will flag it
    }

    const timestamp = now();
    const { active, ...rest } = args;
    return await ctx.db.insert("people", {
      ...rest,
      active: active ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("people"),
    ...personFields,
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await requirePerson(ctx, id);
    await requireDepartment(ctx, fields.departmentId);
    await assertManagerAssignment(ctx, id, fields.managerId);

    if (fields.districtId) {
      const district = await ctx.db.get(fields.districtId);
      if (!district) userError("Distretto non trovato.");
    }

    await ctx.db.patch(id, {
      ...fields,
      updatedAt: now(),
    });
  },
});

export const setActive = mutation({
  args: {
    id: v.id("people"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const person = await requirePerson(ctx, args.id);
    if (!args.active) {
      const reports = await ctx.db
        .query("people")
        .withIndex("by_manager", (q) => q.eq("managerId", args.id))
        .collect();
      const activeReports = reports.filter((r) => r.active);
      if (activeReports.length > 0) {
        userError(
          `Non puoi disattivare questa persona perché ha ${activeReports.length} riport${activeReports.length === 1 ? "o" : "i"} diretti attivi. Riassegna prima il loro responsabile.`,
        );
      }
    }
    await ctx.db.patch(person._id, {
      active: args.active,
      updatedAt: now(),
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const setPhoto = mutation({
  args: {
    id: v.id("people"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const person = await requirePerson(ctx, args.id);
    const old = person.photoStorageId;
    await ctx.db.patch(args.id, {
      photoStorageId: args.storageId,
      updatedAt: now(),
    });
    if (old && old !== args.storageId) {
      try {
        await ctx.storage.delete(old);
      } catch {
        // Old file may already be gone — ignore
      }
    }
  },
});

export const clearPhoto = mutation({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    const person = await requirePerson(ctx, args.id);
    const old = person.photoStorageId;
    await ctx.db.patch(args.id, {
      photoStorageId: undefined,
      updatedAt: now(),
    });
    if (old) {
      try {
        await ctx.storage.delete(old);
      } catch {
        // ignore
      }
    }
  },
});
