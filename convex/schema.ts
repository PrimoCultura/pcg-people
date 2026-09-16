import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { networkRole, organizationalPlacement, personType, reportingType } from "./lib/enums";

export default defineSchema({
  people: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    role: v.string(),
    departmentId: v.id("departments"),
    managerId: v.optional(v.id("people")),
    /** Absent = line (backward compatible). */
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
    photoStorageId: v.optional(v.id("_storage")),
    active: v.boolean(),
    isOrgRoot: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["active"])
    .index("by_department", ["departmentId"])
    .index("by_manager", ["managerId"])
    .index("by_type", ["type"])
    .index("by_district", ["districtId"])
    .index("by_network_role", ["networkRole"])
    .index("by_email", ["email"]),

  departments: defineTable({
    name: v.string(),
    slug: v.string(),
    shortDescription: v.string(),
    description: v.string(),
    headId: v.optional(v.id("people")),
    contactFor: v.array(v.string()),
    tags: v.array(v.string()),
    order: v.optional(v.number()),
    /** Absent = line. Staff depts appear in the manager's Staff band. */
    organizationalPlacement: v.optional(organizationalPlacement),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active"])
    .index("by_order", ["order"]),

  districts: defineTable({
    name: v.string(),
    slug: v.string(),
    shortName: v.optional(v.string()),
    managerId: v.id("people"),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active"]),

  clinics: defineTable({
    name: v.string(),
    slug: v.string(),
    city: v.string(),
    region: v.optional(v.string()),
    address: v.optional(v.string()),
    districtId: v.id("districts"),
    areaManagerId: v.id("people"),
    active: v.boolean(),
    order: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_area_manager", ["areaManagerId"])
    .index("by_district", ["districtId"])
    .index("by_active", ["active"])
    .index("by_slug", ["slug"]),

  meta: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
