"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClinicList } from "@/components/network/ClinicList";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import type { Clinic } from "@/data/clinic";
import type { District } from "@/data/district";
import { getPersonFullName, type Person } from "@/data/types";
import { searchNetwork } from "@/lib/searchNetwork";

type NetworkSearchProps = {
  people: Person[];
  clinics: Clinic[];
  districts: District[];
};

export function NetworkSearch({
  people,
  clinics,
  districts,
}: NetworkSearchProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => searchNetwork(query, { people, clinics, districts }),
    [query, people, clinics, districts],
  );
  const hasQuery = query.trim().length > 0;

  return (
    <div className="mt-8 sm:mt-10">
      <label htmlFor="network-search" className="sr-only">
        Cerca una clinica, una città o un Area Manager
      </label>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pcg-text-muted"
        >
          <SearchIcon />
        </span>
        <input
          id="network-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca una clinica, una città o un Area Manager"
          autoComplete="off"
          className="h-14 w-full rounded-pcg border border-pcg-border bg-pcg-bg pl-12 pr-4 text-base text-pcg-text outline-none transition placeholder:text-pcg-text-muted focus:border-pcg-primary"
        />
      </div>

      <div className="mt-5" role="region" aria-live="polite">
        {hasQuery ? (
          results.length > 0 ? (
            <ul className="space-y-4">
              {results.map((result) =>
                result.kind === "clinic" ? (
                  <li
                    key={`clinic-${result.clinic.id}`}
                    className="border-b border-pcg-border pb-4"
                  >
                    <p className="font-semibold text-pcg-ink">
                      {result.clinic.name}
                    </p>
                    <p className="mt-1 text-sm text-pcg-text-secondary">
                      {result.clinic.city}
                      {result.clinic.region
                        ? ` · ${result.clinic.region}`
                        : ""}
                    </p>
                    <dl className="mt-3 space-y-1.5 text-sm">
                      {result.areaManager ? (
                        <div className="flex flex-wrap gap-x-2">
                          <dt className="text-pcg-text-muted">Area Manager</dt>
                          <dd>
                            <Link
                              href={`/persone/${result.areaManager.id}`}
                              className="text-pcg-primary hover:text-pcg-primary-hover"
                            >
                              {getPersonFullName(result.areaManager)}
                            </Link>
                          </dd>
                        </div>
                      ) : null}
                      {result.districtManager ? (
                        <div className="flex flex-wrap gap-x-2">
                          <dt className="text-pcg-text-muted">
                            District Manager
                          </dt>
                          <dd>
                            <Link
                              href={`/persone/${result.districtManager.id}`}
                              className="text-pcg-primary hover:text-pcg-primary-hover"
                            >
                              {getPersonFullName(result.districtManager)}
                            </Link>
                          </dd>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-x-2">
                        <dt className="text-pcg-text-muted">District</dt>
                        <dd>
                          <Link
                            href={`/network/${result.clinic.districtId}`}
                            className="text-pcg-text-secondary hover:text-pcg-primary"
                          >
                            {result.districtName}
                          </Link>
                        </dd>
                      </div>
                    </dl>
                  </li>
                ) : (
                  <li
                    key={`person-${result.person.id}`}
                    className="border-b border-pcg-border pb-4"
                  >
                    <Link
                      href={`/persone/${result.person.id}`}
                      className="group inline-flex items-center gap-3 rounded-pcg-sm"
                    >
                      <PersonAvatar person={result.person} size="sm" />
                      <span>
                        <span className="block font-semibold text-pcg-ink group-hover:text-pcg-primary">
                          {getPersonFullName(result.person)}
                        </span>
                        <span className="block text-sm text-pcg-text-secondary">
                          {result.person.role}
                          {result.districtName
                            ? ` · ${result.districtName}`
                            : ""}
                        </span>
                      </span>
                    </Link>
                    <ClinicList clinics={result.clinics} showCity />
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="text-sm text-pcg-text-secondary">
              Nessun risultato per “{query.trim()}”. Prova con una città, una
              clinica o un Area Manager.
            </p>
          )
        ) : (
          <p className="text-sm text-pcg-text-muted">
            Esempi: Monza, Torino, Roma, Area Manager.
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
