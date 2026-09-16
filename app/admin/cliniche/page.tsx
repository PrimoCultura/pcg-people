"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminClinicsPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <AdminClinicsBody />;
}

function AdminClinicsBody() {
  const clinics = useQuery(api.clinics.listAll);
  const districts = useQuery(api.districts.listAll);
  const people = useQuery(api.people.listAll);

  if (
    clinics === undefined ||
    districts === undefined ||
    people === undefined
  ) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const districtName = new Map(districts.map((d) => [d._id, d.name]));
  const amName = new Map(
    people.map((p) => [p._id, `${p.firstName} ${p.lastName}`]),
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-pcg-ink">Cliniche</h2>
          <p className="mt-1 text-sm text-pcg-text-secondary">
            {clinics.length} in elenco
          </p>
        </div>
        <Link
          href="/admin/cliniche/nuova"
          className="rounded-pcg bg-pcg-primary px-4 py-2 text-sm font-medium text-white hover:bg-pcg-primary-hover"
        >
          Nuova
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-pcg border border-pcg-border bg-pcg-bg">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-pcg-border bg-pcg-bg-subtle text-xs uppercase tracking-wider text-pcg-text-muted">
            <tr>
              <th className="px-3 py-3">Nome</th>
              <th className="px-3 py-3">Città</th>
              <th className="px-3 py-3">Regione</th>
              <th className="px-3 py-3">District</th>
              <th className="px-3 py-3">Area Manager</th>
              <th className="px-3 py-3">Stato</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr
                key={c._id}
                className="border-b border-pcg-border/70 last:border-0"
              >
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/cliniche/${c._id}`}
                    className="font-medium text-pcg-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-3 text-pcg-text-secondary">{c.city}</td>
                <td className="px-3 py-3 text-pcg-text-secondary">
                  {c.region ?? "—"}
                </td>
                <td className="px-3 py-3 text-pcg-text-secondary">
                  {districtName.get(c.districtId) ?? "—"}
                </td>
                <td className="px-3 py-3 text-pcg-text-secondary">
                  {amName.get(c.areaManagerId) ?? "—"}
                </td>
                <td className="px-3 py-3 text-pcg-text-secondary">
                  {c.active ? "Attivo" : "Disattivo"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
