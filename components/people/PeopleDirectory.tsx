"use client";

import { useMemo, useState } from "react";
import { PeopleFilters } from "@/components/people/PeopleFilters";
import { PersonCard } from "@/components/people/PersonCard";
import type { Department } from "@/data/department";
import type { Person } from "@/data/types";
import { filterPeople } from "@/lib/searchPeople";

type PeopleDirectoryProps = {
  people: Person[];
  departments: Department[];
};

export function PeopleDirectory({ people, departments }: PeopleDirectoryProps) {
  const [query, setQuery] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [area, setArea] = useState<"all" | "hq" | "network">("all");

  const results = useMemo(
    () => filterPeople(people, { query, departmentId, area }),
    [people, query, departmentId, area],
  );

  const hasActiveFilters =
    query.trim().length > 0 || departmentId !== "" || area !== "all";

  const countLabel = hasActiveFilters
    ? `${results.length} ${results.length === 1 ? "risultato" : "risultati"}`
    : `${results.length} ${results.length === 1 ? "persona" : "persone"}`;

  return (
    <div className="mt-8 sm:mt-10">
      <div className="relative">
        <label htmlFor="people-directory-search" className="sr-only">
          Cerca per nome, ruolo, attività o competenza
        </label>
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pcg-text-muted"
        >
          <SearchIcon />
        </span>
        <input
          id="people-directory-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca per nome, ruolo, attività o competenza"
          autoComplete="off"
          className="h-14 w-full rounded-pcg border border-pcg-border bg-pcg-bg pl-12 pr-4 text-base text-pcg-text outline-none transition placeholder:text-pcg-text-muted focus:border-pcg-primary"
        />
      </div>

      <div className="mt-6">
        <PeopleFilters
          departments={departments}
          value={{ departmentId, area }}
          onChange={(next) => {
            setDepartmentId(next.departmentId);
            setArea(next.area);
          }}
        />
      </div>

      <div className="mt-8 flex items-baseline justify-between gap-4 border-t border-pcg-border pt-6">
        <p className="text-sm text-pcg-text-secondary" aria-live="polite">
          {countLabel}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDepartmentId("");
              setArea("all");
            }}
            className="rounded-pcg-sm text-sm font-medium text-pcg-primary hover:text-pcg-primary-hover"
          >
            Reimposta
          </button>
        ) : null}
      </div>

      <div
        className="mt-6"
        role="region"
        aria-live="polite"
        aria-label="Elenco persone"
      >
        {results.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((person) => (
              <li key={person.id}>
                <PersonCard person={person} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-md text-sm leading-relaxed text-pcg-text-secondary">
            {hasActiveFilters
              ? "Nessuna persona corrisponde a ricerca e filtri selezionati. Prova a modificare i criteri o a reimpostare."
              : "Nessuna persona disponibile al momento."}
          </p>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M20 20L16.5 16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
