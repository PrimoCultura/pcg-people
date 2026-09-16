"use client";

import { useState } from "react";
import { OrganizationFlow } from "@/components/organization/OrganizationFlow";
import type { Clinic } from "@/data/clinic";
import type { Person } from "@/data/types";
import type { OrgMode } from "@/lib/organizationTree";

type OrganizationViewProps = {
  people: Person[];
  clinics?: Clinic[];
};

export function OrganizationView({
  people,
  clinics = [],
}: OrganizationViewProps) {
  const [mode, setMode] = useState<OrgMode>("organization");

  return (
    <div className="mt-8 sm:mt-10">
      <div
        className="inline-flex border-b border-pcg-border"
        role="tablist"
        aria-label="Vista organigramma"
      >
        <ModeTab
          label="Organizzazione"
          selected={mode === "organization"}
          onSelect={() => setMode("organization")}
        />
        <ModeTab
          label="Network"
          selected={mode === "network"}
          onSelect={() => setMode("network")}
        />
      </div>

      <p className="mt-4 max-w-2xl text-sm text-pcg-text-secondary">
        {mode === "organization"
          ? "Gerarchia completa PCG a partire dal vertice, basata sui riporti diretti. Espandi i rami per esplorare i team."
          : "Ramo Network: Head of Network → District Manager → Area Manager. Le cliniche si aprono dal dettaglio AM."}
      </p>

      <OrganizationFlow
        key={mode}
        mode={mode}
        people={people}
        clinics={clinics}
      />
    </div>
  );
}

function ModeTab({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={[
        "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        selected
          ? "border-pcg-primary text-pcg-primary"
          : "border-transparent text-pcg-text-secondary hover:text-pcg-primary",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
