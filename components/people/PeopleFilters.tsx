import type { PersonArea } from "@/data/types";
import type { Department } from "@/data/department";

export type PeopleFiltersValue = {
  departmentId: string;
  area: "all" | PersonArea;
};

type PeopleFiltersProps = {
  departments: Department[];
  value: PeopleFiltersValue;
  onChange: (value: PeopleFiltersValue) => void;
};

const AREA_OPTIONS: { value: PeopleFiltersValue["area"]; label: string }[] = [
  { value: "all", label: "Tutti" },
  { value: "hq", label: "HQ" },
  { value: "network", label: "Network" },
];

export function PeopleFilters({
  departments,
  value,
  onChange,
}: PeopleFiltersProps) {
  return (
    <div className="flex flex-col gap-5">
      <fieldset className="min-w-0">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
          Dipartimento
        </legend>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtra per dipartimento"
        >
          <FilterChip
            label="Tutti"
            active={value.departmentId === ""}
            onClick={() => onChange({ ...value, departmentId: "" })}
          />
          {departments.map((department) => (
            <FilterChip
              key={department.id}
              label={department.name}
              active={value.departmentId === department.id}
              onClick={() =>
                onChange({ ...value, departmentId: department.id })
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
          Area
        </legend>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtra per area"
        >
          {AREA_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={value.area === option.value}
              onClick={() => onChange({ ...value, area: option.value })}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

type FilterChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-pcg border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-pcg-primary bg-pcg-primary-soft text-pcg-primary"
          : "border-pcg-border bg-pcg-bg text-pcg-text-secondary hover:border-pcg-border-strong hover:text-pcg-primary",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
