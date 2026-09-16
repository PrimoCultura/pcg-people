import type { District } from "@/data/district";
import { getPersonById, mockPeople } from "@/data/mockPeople";
import { isAreaManager, isDistrictManager, type Person } from "@/data/types";

export const mockDistricts: District[] = [
  {
    id: "nord",
    name: "District Nord",
    shortName: "Nord",
    managerId: "p-008",
    description:
      "Copre le strutture del Nord Italia, con focus su Piemonte e Lombardia.",
    order: 1,
  },
  {
    id: "centro",
    name: "District Centro",
    shortName: "Centro",
    managerId: "p-016",
    description:
      "Coordina le cliniche del Centro Italia, con riferimento sul Lazio.",
    order: 2,
  },
  {
    id: "sud",
    name: "District Sud",
    shortName: "Sud",
    managerId: "p-021",
    description:
      "Segue le cliniche del Sud Italia e supporta i team sul territorio.",
    order: 3,
  },
];

export function getDistrictById(id: string): District | undefined {
  return mockDistricts.find((district) => district.id === id);
}

export function getDistricts(): District[] {
  return mockDistricts
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getDistrictName(districtId: string): string {
  return getDistrictById(districtId)?.name ?? districtId;
}

export function getDistrictManager(
  district: District,
): Person | undefined {
  return getPersonById(district.managerId);
}

/** Area Managers assigned to a district (via districtId). */
export function getDistrictAreaManagers(districtId: string): Person[] {
  return mockPeople
    .filter(
      (person) =>
        isAreaManager(person) && person.districtId === districtId,
    )
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}

export function getDistrictManagersReportingTo(headId: string): Person[] {
  return mockPeople
    .filter(
      (person) =>
        isDistrictManager(person) && person.managerId === headId,
    )
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}
