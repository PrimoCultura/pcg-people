import { getDepartmentName } from "@/data/mockDepartments";
import { getDistrictName } from "@/data/mockDistricts";
import type { Person } from "@/data/types";

export function getPersonDepartmentLabel(person: Person): string {
  return person.departmentLabel ?? getDepartmentName(person.departmentId);
}

export function getPersonDistrictLabel(person: Person): string | undefined {
  if (person.districtLabel) return person.districtLabel;
  if (person.districtId) return getDistrictName(person.districtId);
  return undefined;
}
