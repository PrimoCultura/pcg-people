import type { Clinic } from "@/data/clinic";
import type { District } from "@/data/district";
import {
  getPersonFullName,
  isAreaManager,
  type Person,
} from "@/data/types";
import { normalizeSearchText } from "@/lib/searchPeople";

export type NetworkClinicResult = {
  kind: "clinic";
  clinic: Clinic;
  areaManager?: Person;
  districtManager?: Person;
  districtName: string;
};

export type NetworkPersonResult = {
  kind: "person";
  person: Person;
  clinics: Clinic[];
  districtName?: string;
};

export type NetworkSearchResult = NetworkClinicResult | NetworkPersonResult;

export type NetworkSearchData = {
  people: Person[];
  clinics: Clinic[];
  districts: District[];
};

export function searchNetwork(
  query: string,
  data: NetworkSearchData,
): NetworkSearchResult[] {
  const q = normalizeSearchText(query);
  if (!q) return [];

  const { people, clinics, districts } = data;
  const districtById = new Map(districts.map((d) => [d.id, d]));
  const personById = new Map(people.map((p) => [p.id, p]));
  const results: NetworkSearchResult[] = [];
  const seenPeople = new Set<string>();

  for (const clinic of clinics) {
    const haystack = normalizeSearchText(
      [clinic.name, clinic.city, clinic.region ?? ""].join(" "),
    );
    if (!haystack.includes(q)) continue;

    const areaManager = personById.get(clinic.areaManagerId);
    const district = districtById.get(clinic.districtId);
    const districtManager = district
      ? personById.get(district.managerId)
      : undefined;

    results.push({
      kind: "clinic",
      clinic,
      areaManager,
      districtManager,
      districtName: district?.name ?? clinic.districtId,
    });
  }

  for (const person of people) {
    if (!isAreaManager(person)) continue;
    const name = normalizeSearchText(getPersonFullName(person));
    const role = normalizeSearchText(person.role);
    if (!name.includes(q) && !role.includes(q)) continue;
    if (seenPeople.has(person.id)) continue;
    seenPeople.add(person.id);

    results.push({
      kind: "person",
      person,
      clinics: clinics.filter((c) => c.areaManagerId === person.id),
      districtName: person.districtId
        ? districtById.get(person.districtId)?.name
        : undefined,
    });
  }

  return results;
}
