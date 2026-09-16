"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import { getConvexUserMessage } from "@/lib/convexErrors";
import {
  mapConvexPerson,
  type ConvexPersonDoc,
} from "@/lib/mappers";
import { getPersonFullName, type Person } from "@/data/types";

type Row = {
  doc: ConvexPersonDoc;
  person: Person;
};

export function PeopleAdminTable() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <PeopleAdminTableBody />;
}

function PeopleAdminTableBody() {
  const raw = useQuery(api.people.listAll);
  const setActive = useMutation(api.people.setActive);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<"all" | "hq" | "network">("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!raw) return [] as Row[];
    return (raw as ConvexPersonDoc[]).map((doc) => ({
      doc,
      person: mapConvexPerson(doc),
    }));
  }, [raw]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ doc, person }) => {
      if (area !== "all" && person.type !== area) return false;
      if (activeOnly && !doc.active) return false;
      if (!q) return true;
      const hay =
        `${person.firstName} ${person.lastName} ${person.role} ${person.email}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, area, activeOnly]);

  const filteredIds = useMemo(
    () => filtered.map(({ person }) => person.id),
    [filtered],
  );

  const allVisibleSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const someVisibleSelected = filteredIds.some((id) => selected.has(id));

  function clearMessages() {
    setFeedback(null);
    setError(null);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const id of filteredIds) next.delete(id);
      } else {
        for (const id of filteredIds) next.add(id);
      }
      return next;
    });
  }

  async function deactivateOne(row: Row) {
    clearMessages();
    const name = getPersonFullName(row.person);
    if (!window.confirm(`Vuoi disattivare ${name}?`)) return;

    setBusyId(row.person.id);
    try {
      await setActive({
        id: row.person.id as Id<"people">,
        active: false,
      });
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(row.person.id);
        return next;
      });
      setFeedback(`${name} è stato disattivato.`);
    } catch (err) {
      setError(getConvexUserMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function reactivateOne(row: Row) {
    clearMessages();
    const name = getPersonFullName(row.person);
    setBusyId(row.person.id);
    try {
      await setActive({
        id: row.person.id as Id<"people">,
        active: true,
      });
      setFeedback(`${name} è stato riattivato.`);
    } catch (err) {
      setError(getConvexUserMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function bulkSetActive(active: boolean) {
    clearMessages();
    const targets = filtered.filter(({ person, doc }) => {
      if (!selected.has(person.id)) return false;
      return active ? !doc.active : doc.active;
    });

    if (targets.length === 0) {
      setError(
        active
          ? "Nessuna persona selezionata da riattivare."
          : "Nessuna persona selezionata da disattivare.",
      );
      return;
    }

    if (!active) {
      const names = targets
        .slice(0, 3)
        .map(({ person }) => getPersonFullName(person))
        .join(", ");
      const extra =
        targets.length > 3 ? ` e altre ${targets.length - 3}` : "";
      if (
        !window.confirm(
          `Vuoi disattivare ${targets.length} person${targets.length === 1 ? "a" : "e"} selezionat${targets.length === 1 ? "a" : "e"}?${names ? `\n\n${names}${extra}` : ""}`,
        )
      ) {
        return;
      }
    }

    setBulkBusy(true);
    let done = 0;
    let blocked = 0;

    for (const row of targets) {
      try {
        await setActive({
          id: row.person.id as Id<"people">,
          active,
        });
        done += 1;
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(row.person.id);
          return next;
        });
      } catch {
        if (!active) blocked += 1;
        else {
          // unexpected for reactivate — count as blocked for summary
          blocked += 1;
        }
      }
    }

    setBulkBusy(false);

    if (active) {
      const parts = [
        `${done} person${done === 1 ? "a" : "e"} riattivat${done === 1 ? "a" : "e"}.`,
      ];
      if (blocked > 0) {
        parts.push(
          `${blocked} non riattivat${blocked === 1 ? "a" : "e"}.`,
        );
      }
      setFeedback(parts.join(" "));
    } else {
      const parts = [
        `${done} person${done === 1 ? "a" : "e"} disattivat${done === 1 ? "a" : "e"}.`,
      ];
      if (blocked > 0) {
        parts.push(
          `${blocked} non disattivat${blocked === 1 ? "a" : "e"} perché ${blocked === 1 ? "ha" : "hanno"} riporti diretti attivi.`,
        );
      }
      setFeedback(parts.join("\n"));
    }
  }

  if (raw === undefined) {
    return <p className="text-sm text-pcg-text-secondary">Caricamento…</p>;
  }

  const selectedCount = selected.size;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-pcg-ink">Persone</h2>
          <p className="mt-1 text-sm text-pcg-text-secondary">
            {filtered.length} in elenco
          </p>
        </div>
        <Link
          href="/admin/persone/nuova"
          className="inline-flex h-10 items-center justify-center rounded-pcg bg-pcg-primary px-4 text-sm font-medium text-white hover:bg-pcg-primary-hover"
        >
          Nuova persona
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca nome, ruolo, email"
          className="h-10 flex-1 rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm outline-none focus:border-pcg-primary"
        />
        <select
          value={area}
          onChange={(e) => setArea(e.target.value as typeof area)}
          className="h-10 rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-sm"
        >
          <option value="all">HQ + Network</option>
          <option value="hq">Solo HQ</option>
          <option value="network">Solo Network</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-pcg-text-secondary">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Solo attivi
        </label>
      </div>

      {selectedCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-pcg border border-pcg-border bg-pcg-bg-subtle px-3 py-2 text-sm">
          <span className="font-medium text-pcg-ink">
            {selectedCount} selezionat{selectedCount === 1 ? "a" : "e"}
          </span>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkSetActive(false)}
            className="text-pcg-text-secondary hover:text-pcg-primary disabled:opacity-50"
          >
            Disattiva selezionate
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => bulkSetActive(true)}
            className="text-pcg-text-secondary hover:text-pcg-primary disabled:opacity-50"
          >
            Riattiva selezionate
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => setSelected(new Set())}
            className="text-pcg-text-muted hover:text-pcg-primary"
          >
            Annulla
          </button>
        </div>
      ) : null}

      {feedback ? (
        <p
          className="mt-4 whitespace-pre-line text-sm text-pcg-primary"
          role="status"
        >
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-pcg border border-pcg-border bg-pcg-bg">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-pcg-border bg-pcg-bg-subtle text-xs uppercase tracking-wider text-pcg-text-muted">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        someVisibleSelected && !allVisibleSelected;
                    }
                  }}
                  onChange={toggleSelectAllVisible}
                  aria-label="Seleziona tutte le righe visibili"
                />
              </th>
              <th className="px-3 py-3 font-medium">Persona</th>
              <th className="px-3 py-3 font-medium">Ruolo</th>
              <th className="hidden px-3 py-3 font-medium md:table-cell">
                Dipartimento
              </th>
              <th className="hidden px-3 py-3 font-medium lg:table-cell">
                Responsabile
              </th>
              <th className="px-3 py-3 font-medium">Tipo</th>
              <th className="px-3 py-3 font-medium">Stato</th>
              <th className="px-3 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const { doc, person } = row;
              const name = getPersonFullName(person);
              const isBusy = busyId === person.id || bulkBusy;
              return (
                <tr
                  key={person.id}
                  className="border-b border-pcg-border/70 last:border-0 hover:bg-pcg-bg-subtle"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(person.id)}
                      onChange={() => toggleSelect(person.id)}
                      aria-label={`Seleziona ${name}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/persone/${person.id}`}
                      className="inline-flex items-center gap-3 text-pcg-ink hover:text-pcg-primary"
                    >
                      <PersonAvatar person={person} size="sm" />
                      <span className="font-medium">{name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-pcg-text-secondary">
                    {person.role}
                  </td>
                  <td className="hidden px-3 py-3 text-pcg-text-secondary md:table-cell">
                    {person.departmentLabel}
                  </td>
                  <td className="hidden px-3 py-3 text-pcg-text-secondary lg:table-cell">
                    {doc.managerName ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-pcg-text-secondary">
                    {person.type === "hq" ? "HQ" : "Network"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        doc.active
                          ? "text-pcg-primary"
                          : "text-pcg-text-muted"
                      }
                    >
                      {doc.active ? "Attivo" : "Inattivo"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {doc.active ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void deactivateOne(row);
                        }}
                        className="text-sm text-pcg-text-secondary hover:text-pcg-primary disabled:opacity-50"
                      >
                        Disattiva
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void reactivateOne(row);
                        }}
                        className="text-sm font-medium text-pcg-primary hover:text-pcg-primary-hover disabled:opacity-50"
                      >
                        Riattiva
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
