"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DepartmentOrganizationView } from "@/components/organization/departments/DepartmentOrganizationView";
import { OrganizationFlow } from "@/components/organization/OrganizationFlow";
import type { Clinic } from "@/data/clinic";
import type { Department } from "@/data/department";
import type { Person } from "@/data/types";
import type { OrgMode } from "@/lib/organizationTree";

type OrgViewMode = OrgMode | "departments";

type OrganizationViewProps = {
  people: Person[];
  clinics?: Clinic[];
  departments?: Department[];
};

function parseViewParam(value: string | null): OrgViewMode {
  if (value === "dipartimenti" || value === "departments") return "departments";
  if (value === "network") return "network";
  return "organization";
}

function viewToParam(mode: OrgViewMode): string | null {
  if (mode === "departments") return "dipartimenti";
  if (mode === "network") return "network";
  return null;
}

export function OrganizationView({
  people,
  clinics = [],
  departments = [],
}: OrganizationViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = parseViewParam(searchParams.get("vista"));

  const selectMode = useCallback(
    (next: OrgViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      const vista = viewToParam(next);
      if (vista) params.set("vista", vista);
      else params.delete("vista");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

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
          onSelect={() => selectMode("organization")}
        />
        <ModeTab
          label="Dipartimenti"
          selected={mode === "departments"}
          onSelect={() => selectMode("departments")}
        />
        <ModeTab
          label="Network"
          selected={mode === "network"}
          onSelect={() => selectMode("network")}
        />
      </div>

      {mode === "departments" ? (
        <DepartmentOrganizationView
          people={people}
          departments={departments}
        />
      ) : (
        <>
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
            departments={departments}
          />
        </>
      )}
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
