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
import type { Team } from "@/data/team";

type DepartmentFocusPageClientProps = {
  departmentId: string;
};

export function DepartmentFocusPageClient({
  departmentId,
}: DepartmentFocusPageClientProps) {
  if (!isConvexConfigured()) {
    const { people, departments, teams } = getMockOrganizationBundle();
    return (
      <DepartmentFocusContent
        departmentId={departmentId}
        people={people}
        departments={departments}
        teams={teams}
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
  const { status, people, departments, teams } = useConvexOrganizationBundle();

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
      teams={teams}
    />
  );
}

function DepartmentFocusContent({
  departmentId,
  people,
  departments,
  teams,
}: {
  departmentId: string;
  people: import("@/data/types").Person[];
  departments: Department[];
  teams: Team[];
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
          className="mt-4 inline-flex items-center gap-1.5 rounded-pcg border border-pcg-border bg-pcg-bg px-3 py-1.5 text-sm font-medium text-pcg-primary hover:border-pcg-primary"
        >
          ← Torna all’organigramma
        </a>
      </div>
    );
  }

  const members = getDepartmentFocusMembers(department, people, departments);
  const head =
    members.find((p) => p.id === department.headId) ??
    people.find((p) => p.id === department.headId) ??
    null;

  return (
    <>
      <DepartmentFocusHeader department={department} head={head} />
      <DepartmentFocusFlow
        department={department}
        people={people}
        departments={departments}
        teams={teams}
      />
    </>
  );
}
