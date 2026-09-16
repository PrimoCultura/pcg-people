import type { Id } from "@/convex/_generated/dataModel";
import type {
  NetworkRole,
  Person,
  PersonArea,
} from "@/data/types";

/** Convex enriched person document (from people.enrichPerson). */
export type ConvexPersonDoc = {
  _id: Id<"people">;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: Id<"departments">;
  managerId?: Id<"people">;
  type: PersonArea;
  networkRole?: NetworkRole;
  districtId?: Id<"districts">;
  email: string;
  phone?: string;
  location?: string;
  shortDescription?: string;
  responsibilities: string[];
  tags: string[];
  photoStorageId?: Id<"_storage">;
  active: boolean;
  isOrgRoot?: boolean;
  departmentName: string;
  managerName: string | null;
  managerRole: string | null;
  districtName: string | null;
  photoUrl: string | null;
};

export type ConvexDepartmentDoc = {
  _id: Id<"departments">;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  headId?: Id<"people">;
  contactFor: string[];
  tags: string[];
  order?: number;
  active: boolean;
};

export type ConvexDistrictDoc = {
  _id: Id<"districts">;
  name: string;
  slug: string;
  shortName?: string;
  managerId: Id<"people">;
  description?: string;
  order?: number;
  active: boolean;
};

export type ConvexClinicDoc = {
  _id: Id<"clinics">;
  name: string;
  slug: string;
  city: string;
  region?: string;
  address?: string;
  districtId: Id<"districts">;
  areaManagerId: Id<"people">;
  active: boolean;
  order?: number;
};

export function mapConvexPerson(doc: ConvexPersonDoc): Person {
  return {
    id: doc._id,
    firstName: doc.firstName,
    lastName: doc.lastName,
    role: doc.role,
    departmentId: doc.departmentId,
    departmentLabel: doc.departmentName,
    email: doc.email,
    phone: doc.phone ?? "",
    shortDescription: doc.shortDescription ?? "",
    canHelpWith: doc.responsibilities,
    tags: doc.tags,
    type: doc.type,
    photoUrl: doc.photoUrl,
    managerId: doc.managerId,
    location: doc.location,
    districtId: doc.districtId,
    districtLabel: doc.districtName ?? undefined,
    networkRole: doc.networkRole,
    isOrgRoot: doc.isOrgRoot,
  };
}

export function mapConvexDepartment(doc: ConvexDepartmentDoc) {
  return {
    id: doc._id,
    name: doc.name,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    description: doc.description,
    headId: doc.headId,
    contactFor: doc.contactFor,
    tags: doc.tags,
    order: doc.order,
  };
}

export function mapConvexClinic(doc: ConvexClinicDoc) {
  return {
    id: doc._id,
    name: doc.name,
    city: doc.city,
    region: doc.region,
    address: doc.address,
    districtId: doc.districtId,
    areaManagerId: doc.areaManagerId,
    order: doc.order,
    active: doc.active,
  };
}

export function mapConvexDistrict(doc: ConvexDistrictDoc) {
  return {
    id: doc._id,
    name: doc.name,
    slug: doc.slug,
    shortName: doc.shortName,
    managerId: doc.managerId,
    description: doc.description,
    order: doc.order,
  };
}
