"use client";

import {
  DepartmentFocusFlow,
  DepartmentFocusHeader,
} from "@/components/organization/departments/DepartmentFocusFlow";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import type { Department } from "@/data/department";
import {
  getMockOrganizationBundle,
  useConvexOrganizationBundle,
} from "@/lib/data/usePublicData";
import {
  getDepartmentById,
  getDepartmentFocusMembers,
} from "@/lib/departmentOrganizationTree";

type DepartmentFocusPageClientProps = {
  departmentId: string;
};

export function DepartmentFocusPageClient({
  departmentId,
}: DepartmentFocusPageClientProps) {
  if (!isConvexConfigured()) {
    const { people, departments } = getMockOrganizationBundle();
    return (
      <DepartmentFocusContent
        departmentId={departmentId}
        people={people}
        departments={departments}
      />
    );
  }
  return <DepartmentFocusFromConvex departmentId={departmentId} />;
}

function DepartmentFocusFromConvex({
  departmentId,
}: {
  departmentId: string;
}) {
  const { status, people, departments } = useConvexOrganizationBundle();

  if (status === "loading") {
    return (
      <p className="mt-10 text-sm text-pcg-text-secondary">
        Caricamento organigramma dipartimento…
      </p>
    );
  }

  return (
    <DepartmentFocusContent
      departmentId={departmentId}
      people={people}
      departments={departments}
    />
  );
}

function DepartmentFocusContent({
  departmentId,
  people,
  departments,
}: {
  departmentId: string;
  people: import("@/data/types").Person[];
  departments: Department[];
}) {
  const department = getDepartmentById(departmentId, departments, people);

  if (!department) {
    return (
      <div className="mt-8 space-y-3">
        <p className="text-sm text-pcg-text-secondary">
          Dipartimento non trovato.
        </p>
        <a
          href="/organizzazione?vista=dipartimenti"
          className="text-sm font-medium text-pcg-primary hover:text-pcg-primary-hover"
        >
          ← Torna all’organigramma
        </a>
      </div>
    );
  }

  const members = getDepartmentFocusMembers(department, people);
  const head =
    members.find((p) => p.id === department.headId) ??
    people.find((p) => p.id === department.headId) ??
    null;

  return (
    <>
      <DepartmentFocusHeader department={department} head={head} />
      <DepartmentFocusFlow department={department} people={people} />
    </>
  );
}
