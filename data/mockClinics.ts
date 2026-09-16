import type { Clinic } from "@/data/clinic";
import { getPersonById } from "@/data/mockPeople";
import type { Person } from "@/data/types";

/**
 * Clinic catalog — assignment is via areaManagerId / districtId only.
 * Area Managers:
 * - p-007 Francesca Romano (nord)
 * - p-017 Silvia Lombardi (nord)
 * - p-018 Giorgio Marchetti (centro)
 * - p-019 Anna Barbieri (sud)
 */
export const mockClinics: Clinic[] = [
  {
    id: "cl-to-centro",
    name: "Torino Centro",
    city: "Torino",
    region: "Piemonte",
    address: "Via Roma 12",
    districtId: "nord",
    areaManagerId: "p-007",
    active: true,
    order: 1,
  },
  {
    id: "cl-to-mirafiori",
    name: "Torino Mirafiori",
    city: "Torino",
    region: "Piemonte",
    districtId: "nord",
    areaManagerId: "p-007",
    active: true,
    order: 2,
  },
  {
    id: "cl-asti",
    name: "Asti",
    city: "Asti",
    region: "Piemonte",
    districtId: "nord",
    areaManagerId: "p-007",
    active: true,
    order: 3,
  },
  {
    id: "cl-alessandria",
    name: "Alessandria",
    city: "Alessandria",
    region: "Piemonte",
    districtId: "nord",
    areaManagerId: "p-007",
    active: true,
    order: 4,
  },
  {
    id: "cl-cuneo",
    name: "Cuneo",
    city: "Cuneo",
    region: "Piemonte",
    districtId: "nord",
    areaManagerId: "p-007",
    active: true,
    order: 5,
  },
  {
    id: "cl-mi-duomo",
    name: "Milano Duomo",
    city: "Milano",
    region: "Lombardia",
    districtId: "nord",
    areaManagerId: "p-017",
    active: true,
    order: 6,
  },
  {
    id: "cl-mi-navigli",
    name: "Milano Navigli",
    city: "Milano",
    region: "Lombardia",
    districtId: "nord",
    areaManagerId: "p-017",
    active: true,
    order: 7,
  },
  {
    id: "cl-monza",
    name: "Monza",
    city: "Monza",
    region: "Lombardia",
    districtId: "nord",
    areaManagerId: "p-017",
    active: true,
    order: 8,
  },
  {
    id: "cl-bergamo",
    name: "Bergamo",
    city: "Bergamo",
    region: "Lombardia",
    districtId: "nord",
    areaManagerId: "p-017",
    active: true,
    order: 9,
  },
  {
    id: "cl-como",
    name: "Como",
    city: "Como",
    region: "Lombardia",
    districtId: "nord",
    areaManagerId: "p-017",
    active: true,
    order: 10,
  },
  {
    id: "cl-roma-prati",
    name: "Roma Prati",
    city: "Roma",
    region: "Lazio",
    districtId: "centro",
    areaManagerId: "p-018",
    active: true,
    order: 11,
  },
  {
    id: "cl-roma-eur",
    name: "Roma Eur",
    city: "Roma",
    region: "Lazio",
    districtId: "centro",
    areaManagerId: "p-018",
    active: true,
    order: 12,
  },
  {
    id: "cl-roma-tiburtina",
    name: "Roma Tiburtina",
    city: "Roma",
    region: "Lazio",
    districtId: "centro",
    areaManagerId: "p-018",
    active: true,
    order: 13,
  },
  {
    id: "cl-tivoli",
    name: "Tivoli",
    city: "Tivoli",
    region: "Lazio",
    districtId: "centro",
    areaManagerId: "p-018",
    active: true,
    order: 14,
  },
  {
    id: "cl-frosinone",
    name: "Frosinone",
    city: "Frosinone",
    region: "Lazio",
    districtId: "centro",
    areaManagerId: "p-018",
    active: true,
    order: 15,
  },
  {
    id: "cl-napoli",
    name: "Napoli Centro",
    city: "Napoli",
    region: "Campania",
    districtId: "sud",
    areaManagerId: "p-019",
    active: true,
    order: 16,
  },
  {
    id: "cl-salerno",
    name: "Salerno",
    city: "Salerno",
    region: "Campania",
    districtId: "sud",
    areaManagerId: "p-019",
    active: true,
    order: 17,
  },
  {
    id: "cl-bari",
    name: "Bari",
    city: "Bari",
    region: "Puglia",
    districtId: "sud",
    areaManagerId: "p-019",
    active: true,
    order: 18,
  },
  {
    id: "cl-lecce",
    name: "Lecce",
    city: "Lecce",
    region: "Puglia",
    districtId: "sud",
    areaManagerId: "p-019",
    active: true,
    order: 19,
  },
  {
    id: "cl-catania",
    name: "Catania",
    city: "Catania",
    region: "Sicilia",
    districtId: "sud",
    areaManagerId: "p-019",
    active: true,
    order: 20,
  },
];

export function getClinicById(id: string): Clinic | undefined {
  return mockClinics.find((clinic) => clinic.id === id);
}

export function getClinicsByDistrict(districtId: string): Clinic[] {
  return mockClinics
    .filter((clinic) => clinic.districtId === districtId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getAreaManagerClinics(areaManagerId: string): Clinic[] {
  return mockClinics
    .filter((clinic) => clinic.areaManagerId === areaManagerId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getClinicAreaManager(clinic: Clinic): Person | undefined {
  return getPersonById(clinic.areaManagerId);
}
