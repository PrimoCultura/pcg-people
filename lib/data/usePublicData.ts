"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Clinic } from "@/data/clinic";
import type { Department } from "@/data/department";
import type { District } from "@/data/district";
import {
  getDepartmentById,
  getDepartmentHead,
  getDepartmentMembers,
  getDepartmentsWithMembers,
  getHqDepartments,
} from "@/data/mockDepartments";
import {
  getAreaManagerClinics,
  getClinicsByDistrict,
  mockClinics,
} from "@/data/mockClinics";
import {
  getDistrictAreaManagers,
  getDistrictById,
  getDistrictManager,
  getDistricts,
} from "@/data/mockDistricts";
import {
  getDirectReports,
  getManager,
  getPersonById,
  mockPeople,
} from "@/data/mockPeople";
import type { Person } from "@/data/types";
import {
  mapConvexClinic,
  mapConvexDepartment,
  mapConvexDistrict,
  mapConvexPerson,
  type ConvexClinicDoc,
  type ConvexDepartmentDoc,
  type ConvexDistrictDoc,
  type ConvexPersonDoc,
} from "@/lib/mappers";

export type DataStatus = "loading" | "ready" | "unavailable";

export type NetworkDistrictView = District & {
  manager: Person | null;
  areaManagers: Array<Person & { clinics: Clinic[] }>;
  clinicCount: number;
};

/** Mock-only helpers — safe without ConvexProvider. */
export function getMockActivePeople(): Person[] {
  return mockPeople;
}

export function getMockHqDepartments(): Department[] {
  return getHqDepartments();
}

export function getMockDepartmentsForFilters(): Department[] {
  return getDepartmentsWithMembers();
}

export function getMockOrganizationBundle() {
  return {
    people: mockPeople,
    departments: getDepartmentsWithMembers(),
    districts: getDistricts(),
    clinics: mockClinics as Clinic[],
  };
}

export function getMockNetworkDistricts(): NetworkDistrictView[] {
  return getDistricts().map((d) => {
    const areaManagers = getDistrictAreaManagers(d.id).map((am) => ({
      ...am,
      clinics: getAreaManagerClinics(am.id),
    }));
    return {
      ...d,
      manager: getDistrictManager(d) ?? null,
      areaManagers,
      clinicCount: getClinicsByDistrict(d.id).length,
    };
  });
}

export function getMockPersonProfile(id: string) {
  const person = getPersonById(id);
  if (!person) return null;
  return {
    person,
    manager: getManager(person),
    reports: getDirectReports(person.id),
    clinics: getAreaManagerClinics(person.id),
    allPeople: mockPeople,
    allClinics: mockClinics as Clinic[],
    districts: getDistricts(),
  };
}

export function getMockDepartmentDetail(id: string) {
  const department = getDepartmentById(id);
  if (!department) return null;
  const head = getDepartmentHead(department);
  const members = getDepartmentMembers(department.id).filter(
    (p) => p.id !== department.headId,
  );
  return { department, head: head ?? null, members };
}

export function getMockDistrictDetail(id: string) {
  const district = getDistrictById(id);
  if (!district) return null;
  const manager = getDistrictManager(district) ?? null;
  const areaManagers = getDistrictAreaManagers(district.id).map((am) => ({
    ...am,
    clinics: getAreaManagerClinics(am.id),
  }));
  return {
    district,
    manager,
    areaManagers,
    clinicCount: getClinicsByDistrict(district.id).length,
  };
}

/** Convex hooks — only mount inside ConvexProvider. */
export function useConvexActivePeople(): {
  status: DataStatus;
  people: Person[];
} {
  const raw = useQuery(api.people.listActive);
  return useMemo(() => {
    if (raw === undefined) return { status: "loading" as const, people: [] };
    return {
      status: "ready" as const,
      people: (raw as ConvexPersonDoc[]).map(mapConvexPerson),
    };
  }, [raw]);
}

export function useConvexOrganizationBundle() {
  const raw = useQuery(api.diagnostics.getOrganizationBundle);
  return useMemo(() => {
    if (raw === undefined) {
      return {
        status: "loading" as const,
        people: [] as Person[],
        departments: [] as Department[],
        districts: [] as District[],
        clinics: [] as Clinic[],
      };
    }
    return {
      status: "ready" as const,
      people: (raw.people as ConvexPersonDoc[]).map(mapConvexPerson),
      departments: (raw.departments as ConvexDepartmentDoc[]).map(
        mapConvexDepartment,
      ),
      districts: (raw.districts as ConvexDistrictDoc[]).map(mapConvexDistrict),
      clinics: (raw.clinics as ConvexClinicDoc[]).map(mapConvexClinic),
    };
  }, [raw]);
}

export function useConvexHqDepartments() {
  const raw = useQuery(api.departments.listHq);
  return useMemo(() => {
    if (raw === undefined) {
      return { status: "loading" as const, departments: [] as Department[] };
    }
    return {
      status: "ready" as const,
      departments: (raw as ConvexDepartmentDoc[]).map(mapConvexDepartment),
    };
  }, [raw]);
}

export function useConvexDepartmentsForFilters() {
  const raw = useQuery(api.departments.listActive);
  return useMemo(() => {
    if (raw === undefined) {
      return { status: "loading" as const, departments: [] as Department[] };
    }
    return {
      status: "ready" as const,
      departments: (raw as ConvexDepartmentDoc[]).map(mapConvexDepartment),
    };
  }, [raw]);
}

export function useConvexPersonProfile(id: string) {
  const raw = useQuery(api.people.getById, { id: id as Id<"people"> });
  const reportsRaw = useQuery(api.people.listDirectReports, {
    managerId: id as Id<"people">,
  });
  const clinicsRaw = useQuery(api.clinics.listActive);
  const districtsRaw = useQuery(api.districts.listActive);
  const peopleRaw = useQuery(api.people.listActive);

  return useMemo(() => {
    if (raw === undefined || reportsRaw === undefined) {
      return { status: "loading" as const };
    }
    if (raw === null) return { status: "unavailable" as const };

    const person = mapConvexPerson(raw as ConvexPersonDoc);
    const reports = (reportsRaw as ConvexPersonDoc[]).map(mapConvexPerson);
    const allPeople = peopleRaw
      ? (peopleRaw as ConvexPersonDoc[]).map(mapConvexPerson)
      : [];
    const allClinics = clinicsRaw
      ? (clinicsRaw as ConvexClinicDoc[]).map(mapConvexClinic)
      : [];
    const districts = districtsRaw
      ? (
          districtsRaw as Array<
            ConvexDistrictDoc & { manager?: ConvexPersonDoc | null }
          >
        ).map((d) => mapConvexDistrict(d))
      : [];
    const manager = person.managerId
      ? allPeople.find((p) => p.id === person.managerId)
      : undefined;

    return {
      status: "ready" as const,
      person,
      manager,
      reports,
      clinics: allClinics.filter((c) => c.areaManagerId === person.id),
      allPeople,
      allClinics,
      districts,
    };
  }, [raw, reportsRaw, clinicsRaw, districtsRaw, peopleRaw]);
}

export function useConvexDepartmentDetail(id: string) {
  const raw = useQuery(api.departments.getById, {
    id: id as Id<"departments">,
  });
  return useMemo(() => {
    if (raw === undefined) return { status: "loading" as const };
    if (raw === null) return { status: "unavailable" as const };
    return {
      status: "ready" as const,
      department: mapConvexDepartment(raw as ConvexDepartmentDoc),
      head: raw.head ? mapConvexPerson(raw.head as ConvexPersonDoc) : null,
      members: ((raw.members ?? []) as ConvexPersonDoc[]).map(mapConvexPerson),
    };
  }, [raw]);
}

export function useConvexNetworkDistricts() {
  const raw = useQuery(api.districts.listActive);
  return useMemo(() => {
    if (raw === undefined) {
      return {
        status: "loading" as const,
        districts: [] as NetworkDistrictView[],
      };
    }
    const districts: NetworkDistrictView[] = (
      raw as Array<{
        _id: Id<"districts">;
        name: string;
        slug: string;
        shortName?: string;
        managerId: Id<"people">;
        description?: string;
        order?: number;
        manager: ConvexPersonDoc | null;
        clinicCount: number;
        areaManagers: Array<ConvexPersonDoc & { clinics: ConvexClinicDoc[] }>;
      }>
    ).map((d) => ({
      id: d._id,
      name: d.name,
      shortName: d.shortName,
      managerId: d.managerId,
      description: d.description,
      order: d.order,
      manager: d.manager ? mapConvexPerson(d.manager) : null,
      clinicCount: d.clinicCount,
      areaManagers: d.areaManagers.map((am) => ({
        ...mapConvexPerson(am),
        clinics: (am.clinics ?? []).map(mapConvexClinic),
      })),
    }));
    return { status: "ready" as const, districts };
  }, [raw]);
}

export function useConvexDistrictDetail(id: string) {
  const raw = useQuery(api.districts.getById, { id: id as Id<"districts"> });
  return useMemo(() => {
    if (raw === undefined) return { status: "loading" as const };
    if (raw === null) return { status: "unavailable" as const };
    return {
      status: "ready" as const,
      district: mapConvexDistrict(raw as ConvexDistrictDoc),
      manager: raw.manager
        ? mapConvexPerson(raw.manager as ConvexPersonDoc)
        : null,
      areaManagers: (
        raw.areaManagers as Array<
          ConvexPersonDoc & { clinics: ConvexClinicDoc[] }
        >
      ).map((am) => ({
        ...mapConvexPerson(am),
        clinics: (am.clinics ?? []).map(mapConvexClinic),
      })),
      clinicCount: raw.clinicCount as number,
    };
  }, [raw]);
}
