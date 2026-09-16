"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaManagerBlock } from "@/components/network/AreaManagerBlock";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import { getPersonFullName } from "@/data/types";
import {
  getMockDistrictDetail,
  useConvexDistrictDetail,
} from "@/lib/data/usePublicData";

type DistrictDetailClientProps = {
  districtId: string;
};

export function DistrictDetailClient({
  districtId,
}: DistrictDetailClientProps) {
  if (!isConvexConfigured()) {
    const data = getMockDistrictDetail(districtId);
    if (!data) notFound();
    return <DistrictDetailView {...data} />;
  }
  return <DistrictDetailFromConvex districtId={districtId} />;
}

function DistrictDetailFromConvex({ districtId }: { districtId: string }) {
  const data = useConvexDistrictDetail(districtId);
  if (data.status === "loading") {
    return (
      <p className="text-sm text-pcg-text-secondary">Caricamento distretto…</p>
    );
  }
  if (data.status === "unavailable") notFound();
  return <DistrictDetailView {...data} />;
}

function DistrictDetailView({
  district,
  manager,
  areaManagers,
  clinicCount,
}: NonNullable<ReturnType<typeof getMockDistrictDetail>>) {
  return (
    <>
      <nav
        className="mb-8 text-sm text-pcg-text-secondary"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link
              href="/network"
              className="rounded-pcg-sm text-pcg-primary hover:underline"
            >
              Network
            </Link>
          </li>
          <li aria-hidden className="text-pcg-border-strong">
            /
          </li>
          <li className="text-pcg-text" aria-current="page">
            {district.name}
          </li>
        </ol>
      </nav>

      <header className="border-b border-pcg-border pb-8 sm:pb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-pcg-primary">
          Rete
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-pcg-ink sm:text-4xl">
          {district.name}
        </h1>
        {district.description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pcg-text-secondary">
            {district.description}
          </p>
        ) : null}
        <p className="mt-4 text-sm text-pcg-text-muted">
          {areaManagers.length} Area Manager · {clinicCount} cliniche
        </p>
      </header>

      {manager ? (
        <section className="mt-10" aria-labelledby="district-manager-heading">
          <h2
            id="district-manager-heading"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted"
          >
            District Manager
          </h2>
          <Link
            href={`/persone/${manager.id}`}
            className="group mt-4 inline-flex items-center gap-4 rounded-pcg-sm"
          >
            <PersonAvatar person={manager} size="md" />
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-pcg-ink group-hover:text-pcg-primary">
                {getPersonFullName(manager)}
              </span>
              <span className="mt-0.5 block text-sm text-pcg-text-secondary">
                {manager.role}
              </span>
            </span>
          </Link>
        </section>
      ) : null}

      <section className="mt-12" aria-labelledby="district-am-heading">
        <h2
          id="district-am-heading"
          className="text-xl font-semibold tracking-tight text-pcg-ink"
        >
          Area Manager
        </h2>
        {areaManagers.length > 0 ? (
          <div className="mt-6 border-t border-pcg-border">
            {areaManagers.map((person) => (
              <AreaManagerBlock
                key={person.id}
                person={person}
                clinics={person.clinics}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-pcg-text-secondary">
            Nessun Area Manager assegnato a questo distretto.
          </p>
        )}
      </section>
    </>
  );
}
