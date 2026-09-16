/**
 * Person view-model used by the UI.
 * Populated from Convex (preferred) or mock seed fixtures.
 */
export type PersonArea = "hq" | "network";

export type NetworkRole = "head" | "district-manager" | "area-manager";

/** Placement vs manager in the org chart. Absent = line. */
export type ReportingType = "line" | "staff";

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  /** Stable link to Department.id */
  departmentId: string;
  /** Resolved department display name */
  departmentLabel?: string;
  email: string;
  phone: string;
  shortDescription: string;
  /** Areas / needs people can ask this person about */
  canHelpWith: string[];
  tags: string[];
  /** HQ vs Network — used for directory filters */
  type: PersonArea;
  /** Optional photo URL; when absent, UI falls back to initials */
  photoUrl?: string | null;
  /** Direct manager — Person id, never a display name */
  managerId?: string;
  /**
   * How this person sits under their manager in the org chart.
   * Absent or "line" = hierarchical line; "staff" = staff grouping.
   */
  reportingType?: ReportingType;
  /** Office / workplace label */
  location?: string;
  /** Stable link to District.id (network roles) */
  districtId?: string;
  /** Resolved district display name */
  districtLabel?: string;
  /** Typed network role — prefer over parsing `role` text */
  networkRole?: NetworkRole;
  /** Explicit org-chart root (no manager expected) */
  isOrgRoot?: boolean;
};

export function getPersonFullName(
  person: Pick<Person, "firstName" | "lastName">,
): string {
  return `${person.firstName} ${person.lastName}`;
}

export function getPersonInitials(
  person: Pick<Person, "firstName" | "lastName">,
): string {
  return `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
}

/** Normalize optional reportingType — missing means line. */
export function getReportingType(
  person: Pick<Person, "reportingType">,
): ReportingType {
  return person.reportingType === "staff" ? "staff" : "line";
}

export function isNetworkHead(person: Person): boolean {
  return person.networkRole === "head";
}

export function isDistrictManager(person: Person): boolean {
  return person.networkRole === "district-manager";
}

export function isAreaManager(person: Person): boolean {
  return person.networkRole === "area-manager";
}
