/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clinics from "../clinics.js";
import type * as departments from "../departments.js";
import type * as diagnostics from "../diagnostics.js";
import type * as districts from "../districts.js";
import type * as lib_enums from "../lib/enums.js";
import type * as lib_validators from "../lib/validators.js";
import type * as people from "../people.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clinics: typeof clinics;
  departments: typeof departments;
  diagnostics: typeof diagnostics;
  districts: typeof districts;
  "lib/enums": typeof lib_enums;
  "lib/validators": typeof lib_validators;
  people: typeof people;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
