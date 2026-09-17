/**
 * Department entity — shaped for Convex schema.
 * Members are derived from Person.departmentId, never duplicated here.
 */
export type DepartmentOrganizationalPlacement = "line" | "staff";

export type Department = {
  id: string;
  name: string;
  /** URL/slug key when available (Convex). */
  slug?: string;
  shortDescription: string;
  description: string;
  /** Person id of the department head */
  headId?: string;
  contactFor: string[];
  tags: string[];
  /** Sort order for HQ directory; omit for non-HQ (e.g. Network) */
  order?: number;
  /**
   * How the department sits under its head in the org chart.
   * Absent or "line" = normal; "staff" = Staff band under the head.
   */
  organizationalPlacement?: DepartmentOrganizationalPlacement;
};

export function getDepartmentOrganizationalPlacement(
  department: Pick<Department, "organizationalPlacement">,
): DepartmentOrganizationalPlacement {
  return department.organizationalPlacement === "staff" ? "staff" : "line";
}
