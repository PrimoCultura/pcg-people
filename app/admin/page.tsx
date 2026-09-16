"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { DatabaseManagementSection } from "@/components/admin/DatabaseManagementSection";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import { mapConvexPerson, type ConvexPersonDoc } from "@/lib/mappers";
import { getPersonFullName } from "@/data/types";

export default function AdminDashboardPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <AdminDashboardBody />;
}

function AdminDashboardBody() {
  const router = useRouter();
  const overview = useQuery(api.diagnostics.getAdminOverview);

  if (overview === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const { counts, issues } = overview;
  const issueCount =
    issues.peopleWithoutManager.length +
    issues.departmentsWithoutHead.length +
    issues.networkWithoutDistrict.length +
    (issues.multipleOrgRoots ? 1 : 0) +
    (issues.missingOrgRoot ? 1 : 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-pcg-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-pcg-text-secondary">
          Panoramica operativa dell’organizzazione.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Persone attive" value={counts.peopleActive} />
        <Stat label="Dipartimenti" value={counts.departmentsActive} />
        <Stat label="Distretti" value={counts.districtsActive} />
        <Stat label="Cliniche" value={counts.clinicsActive} />
      </dl>

      <section className="rounded-pcg border border-pcg-border bg-pcg-bg p-5">
        <h3 className="text-lg font-semibold text-pcg-ink">
          Dati da verificare
          {issueCount > 0 ? (
            <span className="ml-2 text-sm font-medium text-amber-700">
              ({issueCount})
            </span>
          ) : null}
        </h3>

        {issueCount === 0 ? (
          <p className="mt-3 text-sm text-pcg-text-secondary">
            Nessuna anomalia evidenziata.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {issues.missingOrgRoot ? (
              <IssueBlock title="Vertice dell’organigramma non configurato">
                <p className="mt-2 text-sm text-pcg-text-secondary">
                  Nessuna persona attiva è impostata come vertice senza
                  responsabile diretto.
                </p>
              </IssueBlock>
            ) : null}

            {issues.multipleOrgRoots ? (
              <IssueBlock title="Più vertici dell’organigramma configurati">
                <ul className="mt-2 space-y-1 text-sm">
                  {(issues.orgRoots as ConvexPersonDoc[]).map((doc) => {
                    const person = mapConvexPerson(doc);
                    return (
                      <li key={person.id}>
                        <Link
                          href={`/admin/persone/${person.id}`}
                          className="text-pcg-primary hover:underline"
                        >
                          {getPersonFullName(person)}
                        </Link>
                        <span className="text-pcg-text-muted">
                          {" "}
                          — {person.role}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </IssueBlock>
            ) : null}

            {issues.peopleWithoutManager.length > 0 ? (
              <IssueBlock
                title={`${issues.peopleWithoutManager.length} persone senza responsabile`}
              >
                <ul className="mt-2 space-y-1 text-sm">
                  {(issues.peopleWithoutManager as ConvexPersonDoc[]).map(
                    (doc) => {
                      const person = mapConvexPerson(doc);
                      return (
                        <li key={person.id}>
                          <Link
                            href={`/admin/persone/${person.id}`}
                            className="text-pcg-primary hover:underline"
                          >
                            {getPersonFullName(person)}
                          </Link>
                          <span className="text-pcg-text-muted">
                            {" "}
                            — {person.role}
                          </span>
                        </li>
                      );
                    },
                  )}
                </ul>
              </IssueBlock>
            ) : null}

            {issues.departmentsWithoutHead.length > 0 ? (
              <IssueBlock
                title={`${issues.departmentsWithoutHead.length} dipartimenti senza responsabile`}
              >
                <ul className="mt-2 space-y-1 text-sm">
                  {issues.departmentsWithoutHead.map((dept) => (
                    <li key={dept._id}>
                      <Link
                        href={`/admin/dipartimenti/${dept._id}`}
                        className="text-pcg-primary hover:underline"
                      >
                        {dept.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </IssueBlock>
            ) : null}

            {issues.networkWithoutDistrict.length > 0 ? (
              <IssueBlock
                title={`${issues.networkWithoutDistrict.length} persone Network senza distretto`}
              >
                <ul className="mt-2 space-y-1 text-sm">
                  {(issues.networkWithoutDistrict as ConvexPersonDoc[]).map(
                    (doc) => {
                      const person = mapConvexPerson(doc);
                      return (
                        <li key={person.id}>
                          <Link
                            href={`/admin/persone/${person.id}`}
                            className="text-pcg-primary hover:underline"
                          >
                            {getPersonFullName(person)}
                          </Link>
                        </li>
                      );
                    },
                  )}
                </ul>
              </IssueBlock>
            ) : null}
          </div>
        )}
      </section>

      <DatabaseManagementSection
        onPurged={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-pcg border border-pcg-border bg-pcg-bg px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-pcg-text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold text-pcg-ink">{value}</dd>
    </div>
  );
}

function IssueBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-pcg-ink">{title}</p>
      {children}
    </div>
  );
}
