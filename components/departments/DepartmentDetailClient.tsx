"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { DepartmentContactFor } from "@/components/departments/DepartmentContactFor";
import { DepartmentHeader } from "@/components/departments/DepartmentHeader";
import { DepartmentLeader } from "@/components/departments/DepartmentLeader";
import { DepartmentTeam } from "@/components/departments/DepartmentTeam";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import {
  getMockDepartmentDetail,
  useConvexDepartmentDetail,
} from "@/lib/data/usePublicData";

type DepartmentDetailClientProps = {
  id: string;
};

export function DepartmentDetailClient({ id }: DepartmentDetailClientProps) {
  if (!isConvexConfigured()) {
    const data = getMockDepartmentDetail(id);
    if (!data) notFound();
    return <DepartmentDetailView {...data} />;
  }
  return <DepartmentDetailFromConvex id={id} />;
}

function DepartmentDetailFromConvex({ id }: { id: string }) {
  const data = useConvexDepartmentDetail(id);
  if (data.status === "loading") {
    return (
      <p className="text-sm text-pcg-text-secondary">
        Caricamento dipartimento…
      </p>
    );
  }
  if (data.status === "unavailable") notFound();
  return <DepartmentDetailView {...data} />;
}

function DepartmentDetailView({
  department,
  head,
  members,
}: NonNullable<ReturnType<typeof getMockDepartmentDetail>>) {
  return (
    <>
      <nav
        className="mb-8 text-sm text-pcg-text-secondary"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link
              href="/dipartimenti"
              className="rounded-pcg-sm text-pcg-primary hover:underline"
            >
              Dipartimenti
            </Link>
          </li>
          <li aria-hidden className="text-pcg-border-strong">
            /
          </li>
          <li className="text-pcg-text" aria-current="page">
            {department.name}
          </li>
        </ol>
      </nav>

      <DepartmentHeader department={department} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-16">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="department-about-heading">
            <h2
              id="department-about-heading"
              className="text-xl font-semibold tracking-tight text-pcg-ink"
            >
              Cosa facciamo
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-pcg-text-secondary">
              {department.description}
            </p>
          </section>

          <DepartmentContactFor items={department.contactFor} />
          <DepartmentTeam members={members} />
        </div>

        <aside className="lg:border-l lg:border-pcg-border lg:pl-8">
          <div className="lg:sticky lg:top-24">
            {head ? <DepartmentLeader head={head} /> : null}
          </div>
        </aside>
      </div>
    </>
  );
}
