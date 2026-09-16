"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PersonAbout } from "@/components/people/PersonAbout";
import { PersonContactInfo } from "@/components/people/PersonContactInfo";
import { PersonNetworkInfo } from "@/components/people/PersonNetworkInfo";
import { PersonOrganization } from "@/components/people/PersonOrganization";
import { PersonProfileHeader } from "@/components/people/PersonProfileHeader";
import { PersonResponsibilities } from "@/components/people/PersonResponsibilities";
import { PersonTags } from "@/components/people/PersonTags";
import { PersonTeam } from "@/components/people/PersonTeam";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import { getPersonFullName } from "@/data/types";
import {
  getMockPersonProfile,
  useConvexPersonProfile,
} from "@/lib/data/usePublicData";

type PersonProfileClientProps = {
  id: string;
};

export function PersonProfileClient({ id }: PersonProfileClientProps) {
  if (!isConvexConfigured()) {
    const data = getMockPersonProfile(id);
    if (!data) notFound();
    return <PersonProfileView {...data} />;
  }
  return <PersonProfileFromConvex id={id} />;
}

function PersonProfileFromConvex({ id }: { id: string }) {
  const data = useConvexPersonProfile(id);

  if (data.status === "loading") {
    return (
      <p className="text-sm text-pcg-text-secondary">Caricamento profilo…</p>
    );
  }
  if (data.status === "unavailable") notFound();
  return <PersonProfileView {...data} />;
}

function PersonProfileView({
  person,
  manager,
  reports,
  clinics,
  allPeople,
  allClinics,
  districts,
}: NonNullable<ReturnType<typeof getMockPersonProfile>>) {
  const fullName = getPersonFullName(person);

  return (
    <>
      <nav className="mb-8 text-sm text-pcg-text-secondary" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link
              href="/persone"
              className="rounded-pcg-sm text-pcg-primary hover:underline"
            >
              Persone
            </Link>
          </li>
          <li aria-hidden className="text-pcg-border-strong">
            /
          </li>
          <li className="text-pcg-text" aria-current="page">
            {fullName}
          </li>
        </ol>
      </nav>

      <PersonProfileHeader person={person} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-16">
        <div className="min-w-0 space-y-12">
          <PersonResponsibilities items={person.canHelpWith} />
          <PersonAbout description={person.shortDescription} />
          <PersonOrganization person={person} manager={manager} />
          <PersonTeam members={reports} />
          <PersonNetworkInfo
            person={person}
            reports={reports}
            allPeople={allPeople}
            clinics={clinics}
            allClinics={allClinics}
            districts={districts}
          />
          <PersonTags tags={person.tags} />
        </div>

        <aside className="lg:border-l lg:border-pcg-border lg:pl-8">
          <div className="lg:sticky lg:top-24">
            <PersonContactInfo person={person} />
          </div>
        </aside>
      </div>
    </>
  );
}
