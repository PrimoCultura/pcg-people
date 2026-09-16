import { query } from "./_generated/server";
import { enrichPerson } from "./people";

/** Aggregate diagnostics for the Admin dashboard. */
export const getAdminOverview = query({
  args: {},
  handler: async (ctx) => {
    const [people, departments, districts, clinics] = await Promise.all([
      ctx.db.query("people").collect(),
      ctx.db.query("departments").collect(),
      ctx.db.query("districts").collect(),
      ctx.db.query("clinics").collect(),
    ]);

    const activePeople = people.filter((p) => p.active);
    const orphans = activePeople.filter((p) => !p.managerId && !p.isOrgRoot);
    const orgRoots = activePeople.filter(
      (p) => p.isOrgRoot === true && !p.managerId,
    );
    const departmentsWithoutHead = departments.filter(
      (d) => d.active && !d.headId,
    );
    const networkWithoutDistrict = activePeople.filter(
      (p) =>
        (p.networkRole === "district-manager" ||
          p.networkRole === "area-manager") &&
        !p.districtId,
    );

    return {
      counts: {
        peopleActive: activePeople.length,
        peopleTotal: people.length,
        departmentsActive: departments.filter((d) => d.active).length,
        districtsActive: districts.filter((d) => d.active).length,
        clinicsActive: clinics.filter((c) => c.active).length,
        orgRoots: orgRoots.length,
      },
      issues: {
        peopleWithoutManager: await Promise.all(
          orphans.map((p) => enrichPerson(ctx, p)),
        ),
        orgRoots: await Promise.all(orgRoots.map((p) => enrichPerson(ctx, p))),
        multipleOrgRoots: orgRoots.length > 1,
        missingOrgRoot: orgRoots.length === 0,
        departmentsWithoutHead,
        networkWithoutDistrict: await Promise.all(
          networkWithoutDistrict.map((p) => enrichPerson(ctx, p)),
        ),
      },
    };
  },
});

/** All active people enriched — single query for organigramma / search. */
export const getOrganizationBundle = query({
  args: {},
  handler: async (ctx) => {
    const people = await ctx.db
      .query("people")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const departments = await ctx.db
      .query("departments")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const districts = await ctx.db
      .query("districts")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    const clinics = await ctx.db
      .query("clinics")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    return {
      people: await Promise.all(people.map((p) => enrichPerson(ctx, p))),
      departments,
      districts,
      clinics,
    };
  },
});
