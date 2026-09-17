"use client";

import { DepartmentOverviewFlow } from "@/components/organization/departments/DepartmentOverviewFlow";
import type { Department } from "@/data/department";
import type { Person } from "@/data/types";

type DepartmentOrganizationViewProps = {
  people: Person[];
  departments: Department[];
};

export function DepartmentOrganizationView({
  people,
  departments,
}: DepartmentOrganizationViewProps) {
  return (
    <div className="mt-4">
      <p className="max-w-2xl text-sm text-pcg-text-secondary">
      Vista per funzione organizzativa a partire dal CEO. Solo dipartimenti:
      clicca una card per aprirne l’organigramma interno (persone e staff).
      </p>
      <DepartmentOverviewFlow people={people} departments={departments} />
    </div>
  );
}
