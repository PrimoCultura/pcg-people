"use client";

import { OrganizationView } from "@/components/organization/OrganizationView";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockOrganizationBundle,
  useConvexOrganizationBundle,
} from "@/lib/data/usePublicData";

export function OrganizationPageClient() {
  if (!isConvexConfigured()) {
    const { people, clinics } = getMockOrganizationBundle();
    return <OrganizationView people={people} clinics={clinics} />;
  }
  return <OrganizationFromConvex />;
}

function OrganizationFromConvex() {
  const { status, people, clinics } = useConvexOrganizationBundle();

  if (status === "loading") {
    return (
      <p className="mt-10 text-sm text-pcg-text-secondary">
        Caricamento organigramma…
      </p>
    );
  }

  return <OrganizationView people={people} clinics={clinics} />;
}
