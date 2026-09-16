"use client";

import { PeopleDirectory } from "@/components/people/PeopleDirectory";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockActivePeople,
  getMockDepartmentsForFilters,
  useConvexActivePeople,
  useConvexDepartmentsForFilters,
} from "@/lib/data/usePublicData";

export function PeoplePageClient() {
  if (!isConvexConfigured()) {
    return (
      <PeopleDirectory
        people={getMockActivePeople()}
        departments={getMockDepartmentsForFilters()}
      />
    );
  }
  return <PeoplePageFromConvex />;
}

function PeoplePageFromConvex() {
  const { status: peopleStatus, people } = useConvexActivePeople();
  const { status: deptStatus, departments } = useConvexDepartmentsForFilters();

  if (peopleStatus === "loading" || deptStatus === "loading") {
    return (
      <p className="mt-10 text-sm text-pcg-text-secondary">
        Caricamento persone…
      </p>
    );
  }

  return <PeopleDirectory people={people} departments={departments} />;
}
