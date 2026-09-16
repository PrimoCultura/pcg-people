"use client";

import { DistrictSection } from "@/components/network/DistrictSection";
import { NetworkSearch } from "@/components/network/NetworkSearch";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockNetworkDistricts,
  getMockOrganizationBundle,
  useConvexNetworkDistricts,
  useConvexOrganizationBundle,
} from "@/lib/data/usePublicData";

export function NetworkPageClient() {
  if (!isConvexConfigured()) {
    const districts = getMockNetworkDistricts();
    const bundle = getMockOrganizationBundle();
    return (
      <>
        <NetworkSearch
          people={bundle.people}
          clinics={bundle.clinics}
          districts={bundle.districts}
        />
        <div className="mt-12 border-t border-pcg-border pt-2 sm:mt-14">
          {districts.map((district) => (
            <DistrictSection key={district.id} district={district} />
          ))}
        </div>
      </>
    );
  }
  return <NetworkFromConvex />;
}

function NetworkFromConvex() {
  const { status, districts } = useConvexNetworkDistricts();
  const searchIndex = useConvexOrganizationBundle();

  if (status === "loading" || searchIndex.status === "loading") {
    return (
      <p className="mt-10 text-sm text-pcg-text-secondary">
        Caricamento network…
      </p>
    );
  }

  return (
    <>
      <NetworkSearch
        people={searchIndex.people}
        clinics={searchIndex.clinics}
        districts={searchIndex.districts}
      />
      <div className="mt-12 border-t border-pcg-border pt-2 sm:mt-14">
        {districts.map((district) => (
          <DistrictSection key={district.id} district={district} />
        ))}
      </div>
    </>
  );
}
