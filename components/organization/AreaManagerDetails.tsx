"use client";

import Link from "next/link";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import type { Clinic } from "@/data/clinic";
import { getPersonFullName, type Person } from "@/data/types";

type AreaManagerDetailsProps = {
  person: Person;
  clinics: Clinic[];
  onClose: () => void;
};

export function AreaManagerDetails({
  person,
  clinics,
  onClose,
}: AreaManagerDetailsProps) {
  const districtName = person.districtLabel;

  return (
    <aside
      className="flex w-full flex-col border-t border-pcg-border bg-pcg-bg lg:w-80 lg:border-l lg:border-t-0"
      aria-label="Dettaglio Area Manager"
    >
      <div className="flex items-start justify-between gap-3 border-b border-pcg-border px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar person={person} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-pcg-ink">
              {getPersonFullName(person)}
            </p>
            <p className="text-sm text-pcg-text-secondary">{person.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-pcg-sm px-2 py-1 text-sm text-pcg-text-muted hover:text-pcg-primary"
          aria-label="Chiudi dettaglio"
        >
          Chiudi
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {districtName ? (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
              Distretto
            </p>
            <p className="mt-1 text-sm text-pcg-text">{districtName}</p>
          </div>
        ) : null}

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
          Cliniche gestite
        </p>
        {clinics.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {clinics.map((clinic) => (
              <li
                key={clinic.id}
                className="border-b border-pcg-border/70 py-2 text-sm text-pcg-text last:border-b-0"
              >
                {clinic.name}
                <span className="text-pcg-text-muted"> · {clinic.city}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-pcg-text-secondary">
            Nessuna clinica assegnata.
          </p>
        )}
      </div>

      <div className="border-t border-pcg-border px-4 py-4">
        <Link
          href={`/persone/${person.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-pcg-primary hover:text-pcg-primary-hover"
        >
          Vai al profilo
          <span aria-hidden>→</span>
        </Link>
      </div>
    </aside>
  );
}
