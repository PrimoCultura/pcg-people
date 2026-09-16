"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminDepartmentsPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <AdminDepartmentsBody />;
}

function AdminDepartmentsBody() {
  const departments = useQuery(api.departments.listAll);

  if (departments === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-pcg-ink">Dipartimenti</h2>
          <p className="mt-1 text-sm text-pcg-text-secondary">
            {departments.length} in elenco
          </p>
        </div>
        <Link
          href="/admin/dipartimenti/nuovo"
          className="rounded-pcg bg-pcg-primary px-4 py-2 text-sm font-medium text-white hover:bg-pcg-primary-hover"
        >
          Nuovo
        </Link>
      </div>
      <ul className="mt-6 divide-y divide-pcg-border rounded-pcg border border-pcg-border bg-pcg-bg">
        {departments.map((d) => (
          <li key={d._id}>
            <Link
              href={`/admin/dipartimenti/${d._id}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-pcg-bg-subtle"
            >
              <span className="font-medium text-pcg-ink">{d.name}</span>
              <span className="text-pcg-text-muted">
                {d.active ? "Attivo" : "Disattivo"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
