import type { Department } from "@/data/department";
import {
  getDepartmentById,
  getDepartmentName,
} from "@/data/mockDepartments";
import { getAreaManagerClinics } from "@/data/mockClinics";
import { getDistrictName } from "@/data/mockDistricts";
import type { Person, PersonArea } from "@/data/types";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function departmentSearchText(department: Department): string {
  return normalize(
    [
      department.name,
      department.shortDescription,
      department.description,
      ...department.contactFor,
      ...department.tags,
    ].join(" "),
  );
}

function personSearchText(person: Person): string {
  const department = getDepartmentById(person.departmentId);
  const clinics = getAreaManagerClinics(person.id);
  return normalize(
    [
      person.firstName,
      person.lastName,
      `${person.firstName} ${person.lastName}`,
      person.role,
      getDepartmentName(person.departmentId),
      person.shortDescription,
      person.districtId ? getDistrictName(person.districtId) : "",
      ...person.tags,
      ...person.canHelpWith,
      department ? departmentSearchText(department) : "",
      ...clinics.flatMap((clinic) => [
        clinic.name,
        clinic.city,
        clinic.region ?? "",
      ]),
    ].join(" "),
  );
}

/** Returns true when the person matches the free-text query. */
export function matchesPersonQuery(person: Person, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return personSearchText(person).includes(q);
}

/**
 * Homepage helper: empty query yields no results.
 * Directory uses filterPeople instead.
 *
 * Matching also includes linked Department fields and managed clinic names,
 * so queries like "Monza" surface the related Area Manager.
 */
export function searchPeople(people: Person[], query: string): Person[] {
  const q = normalize(query);
  if (!q) return [];
  return people.filter((person) => matchesPersonQuery(person, query));
}

export type PeopleFilterState = {
  query: string;
  /** Department.id or "" for all */
  departmentId: string;
  area: "all" | PersonArea;
};

export function filterPeople(
  people: Person[],
  filters: PeopleFilterState,
): Person[] {
  return people.filter((person) => {
    if (!matchesPersonQuery(person, filters.query)) return false;
    if (filters.departmentId && person.departmentId !== filters.departmentId) {
      return false;
    }
    if (filters.area === "hq" && person.type !== "hq") {
      return false;
    }
    if (
      filters.area === "network" &&
      person.type !== "network" &&
      !person.networkRole
    ) {
      return false;
    }
    return true;
  });
}

export { normalize as normalizeSearchText };
