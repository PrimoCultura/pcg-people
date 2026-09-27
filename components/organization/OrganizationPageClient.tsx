"use client";

import { Suspense } from "react";
import { OrganizationView } from "@/components/organization/OrganizationView";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockOrganizationBundle,
  useConvexOrganizationBundle,
} from "@/lib/data/usePublicData";

export function OrganizationPageClient() {
  return (
    <Suspense
      fallback={
        <p className="mt-10 text-sm text-pcg-text-secondary">
          Caricamento organigramma…
        </p>
      }
    >
      <OrganizationPageBody />
    </Suspense>
  );
}

function OrganizationPageBody() {
  if (!isConvexConfigured()) {
    const { people, clinics, departments, teams } = getMockOrganizationBundle();
    return (
      <OrganizationView
        people={people}
        clinics={clinics}
        departments={departments}
        teams={teams}
      />
    );
  }
  return <OrganizationFromConvex />;
}

function OrganizationFromConvex() {
  const { status, people, clinics, departments, teams } =
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
      teams={teams}
    />
  );
}
