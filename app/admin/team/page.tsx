"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminTeamsPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <AdminTeamsBody />;
}

function AdminTeamsBody() {
  const teams = useQuery(api.teams.listAll);
  const departments = useQuery(api.departments.listAll);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!teams) return [];
    const q = search.trim().toLowerCase();
    return teams.filter((t) => {
      if (departmentFilter && t.departmentId !== departmentFilter) return false;
      if (q && !t.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [teams, departmentFilter, search]);

  if (teams === undefined || departments === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-pcg-ink">Team</h2>
          <p className="mt-1 text-sm text-pcg-text-secondary">
            {filtered.length} in elenco
            {filtered.length !== teams.length
              ? ` (su ${teams.length})`
              : ""}
          </p>
        </div>
        <Link
          href="/admin/team/nuovo"
          className="rounded-pcg bg-pcg-primary px-4 py-2 text-sm font-medium text-white hover:bg-pcg-primary-hover"
        >
          Nuovo
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-pcg-ink">
          Dipartimento
          <select
            className="mt-1 h-10 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">Tutti</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-pcg-ink">
          Cerca per nome
          <input
            className="mt-1 h-10 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Es. Payroll"
          />
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-pcg border border-pcg-border bg-pcg-bg">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-pcg-border bg-pcg-bg-subtle text-pcg-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Dipartimento</th>
              <th className="px-4 py-3 font-medium">Responsabile</th>
              <th className="px-4 py-3 font-medium">Membri</th>
              <th className="px-4 py-3 font-medium">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pcg-border">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-pcg-text-secondary"
                >
                  Nessun Team trovato.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t._id} className="hover:bg-pcg-bg-subtle">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/team/${t._id}`}
                      className="font-medium text-pcg-primary hover:underline"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-pcg-text">
                    {t.departmentName || "—"}
                  </td>
                  <td className="px-4 py-3 text-pcg-text">
                    {t.headName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-pcg-text">
                    {t.activeMemberCount}
                  </td>
                  <td className="px-4 py-3 text-pcg-text-muted">
                    {t.active ? "Attivo" : "Disattivo"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
