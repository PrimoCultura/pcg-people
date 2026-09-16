import { v } from "convex/values";

export const personType = v.union(v.literal("hq"), v.literal("network"));

export const networkRole = v.union(
  v.literal("head"),
  v.literal("district-manager"),
  v.literal("area-manager"),
);

/** Organizational placement vs manager — absent means line. */
export const reportingType = v.union(v.literal("line"), v.literal("staff"));

/** Department placement in the org chart — absent means line. */
export const organizationalPlacement = v.union(
  v.literal("line"),
  v.literal("staff"),
);
