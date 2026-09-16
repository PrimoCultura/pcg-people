"use client";

import { useMemo, useState } from "react";
import { PersonCard } from "@/components/people/PersonCard";
import type { Person } from "@/data/types";
import { searchPeople } from "@/lib/searchPeople";

const SUGGESTIONS = [
  "Formazione",
  "Finance",
  "Recruiting",
  "Assicurazioni",
  "Marketing",
  "Area Manager",
] as const;

export const SEARCH_INPUT_ID = "pcg-search";

type HomeHeroSearchProps = {
  people: Person[];
};

export function HomeHeroSearch({ people }: HomeHeroSearchProps) {
  const [query, setQuery] = useState("");
  const resultsId = "pcg-search-results";

  const results = useMemo(
    () => searchPeople(people, query),
    [people, query],
  );

  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
        Cerca una persona, un ruolo, un&apos;attività o un dipartimento
      </label>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pcg-text-muted sm:left-5"
        >
          <SearchIcon />
        </span>
        <input
          id={SEARCH_INPUT_ID}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca una persona, un ruolo, un’attività o un dipartimento"
          autoComplete="off"
          aria-controls={resultsId}
          aria-describedby="pcg-search-suggestions"
          className="h-14 w-full rounded-pcg border border-pcg-border bg-pcg-bg pl-12 pr-4 text-base text-pcg-text shadow-none outline-none transition placeholder:text-pcg-text-muted focus:border-pcg-primary sm:pl-14 sm:text-[1.05rem]"
        />
      </div>

      <div
        id="pcg-search-suggestions"
        className="mt-3 flex flex-wrap gap-2"
        role="group"
        aria-label="Suggerimenti di ricerca"
      >
        {SUGGESTIONS.map((suggestion) => {
          const active =
            query.trim().toLowerCase() === suggestion.toLowerCase();
          return (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              aria-pressed={active}
              className={[
                "rounded-pcg border px-3 py-1.5 text-sm transition-colors",
                active
                  ? "border-pcg-primary bg-pcg-primary-soft text-pcg-primary"
                  : "border-pcg-border bg-pcg-bg text-pcg-text-secondary hover:border-pcg-border-strong hover:text-pcg-primary",
              ].join(" ")}
            >
              {suggestion}
            </button>
          );
        })}
      </div>

      <div id={resultsId} className="mt-5" role="region" aria-live="polite">
        {hasQuery ? (
          results.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-pcg-text-secondary">
                {results.length}{" "}
                {results.length === 1
                  ? "risultato trovato"
                  : "risultati trovati"}
              </p>
              <ul className="grid gap-3">
                {results.map((person) => (
                  <li key={person.id}>
                    <PersonCard person={person} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-pcg-text-secondary">
              Nessun risultato per “{query.trim()}”. Prova con un ruolo, un
              dipartimento o un’esigenza.
            </p>
          )
        ) : null}
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
