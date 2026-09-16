"use client";

import { OrganizationView } from "@/components/organization/OrganizationView";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockOrganizationBundle,
  useConvexOrganizationBundle,
} from "@/lib/data/usePublicData";

export function OrganizationPageClient() {
  if (!isConvexConfigured()) {
    const { people, clinics, departments } = getMockOrganizationBundle();
    return (
      <OrganizationView
        people={people}
        clinics={clinics}
        departments={departments}
      />
    );
  }
  return <OrganizationFromConvex />;
}

function OrganizationFromConvex() {
  const { status, people, clinics, departments } =
    useConvexOrganizationBundle();

  if (status === "loading") {
    return (
      <p className="mt-10 text-sm text-pcg-text-secondary">
        Caricamento organigramma…
      </p>
    );
  }

  return (
    <OrganizationView
      people={people}
      clinics={clinics}
      departments={departments}
    />
  );
}
