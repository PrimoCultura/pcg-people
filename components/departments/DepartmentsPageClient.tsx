"use client";

import { DepartmentList } from "@/components/departments/DepartmentList";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockActivePeople,
  getMockHqDepartments,
  useConvexActivePeople,
  useConvexHqDepartments,
} from "@/lib/data/usePublicData";

export function DepartmentsPageClient() {
  if (!isConvexConfigured()) {
    return (
      <DepartmentList
        departments={getMockHqDepartments()}
        people={getMockActivePeople()}
      />
    );
  }
  return <DepartmentsFromConvex />;
}

function DepartmentsFromConvex() {
  const { status, departments } = useConvexHqDepartments();
  const { status: peopleStatus, people } = useConvexActivePeople();

  if (status === "loading" || peopleStatus === "loading") {
    return (
      <p className="mt-10 text-sm text-pcg-text-secondary">
        Caricamento dipartimenti…
      </p>
    );
  }

  return <DepartmentList departments={departments} people={people} />;
}
