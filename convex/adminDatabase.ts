import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertAdminAccess } from "./lib/adminGuard";
import { userError } from "./lib/validators";

const PURGE_PHRASE = "ELIMINA TUTTO";

/**
 * Destructive admin wipe — empties all app tables and profile photos.
 * Does NOT re-seed. Requires adminPassword + exact confirmation phrase.
 */
export const purgeAll = mutation({
  args: {
    confirmPhrase: v.string(),
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdminAccess({ adminPassword: args.adminPassword });

    if (args.confirmPhrase !== PURGE_PHRASE) {
      userError(
        `Conferma non valida. Digita esattamente ${PURGE_PHRASE} per procedere.`,
      );
    }

    const people = await ctx.db.query("people").collect();
    let photosDeleted = 0;
    let photosFailed = 0;

    for (const person of people) {
      if (!person.photoStorageId) continue;
      try {
        await ctx.storage.delete(person.photoStorageId);
        photosDeleted += 1;
      } catch {
        photosFailed += 1;
      }
    }

    const clinics = await ctx.db.query("clinics").collect();
    for (const clinic of clinics) {
      await ctx.db.delete(clinic._id);
    }

    const districts = await ctx.db.query("districts").collect();
    for (const district of districts) {
      await ctx.db.delete(district._id);
    }

    for (const person of people) {
      await ctx.db.delete(person._id);
    }

    const departments = await ctx.db.query("departments").collect();
    for (const department of departments) {
      await ctx.db.delete(department._id);
    }

    const metaRows = await ctx.db.query("meta").collect();
    for (const row of metaRows) {
      await ctx.db.delete(row._id);
    }

    return {
      ok: true as const,
      deleted: {
        clinics: clinics.length,
        districts: districts.length,
        people: people.length,
        departments: departments.length,
        meta: metaRows.length,
        photosDeleted,
        photosFailed,
      },
    };
  },
});
