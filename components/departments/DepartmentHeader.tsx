import type { Department } from "@/data/department";

type DepartmentHeaderProps = {
  department: Department;
};

export function DepartmentHeader({ department }: DepartmentHeaderProps) {
  const label = typeof department.order === "number" ? "HQ" : "Network";

  return (
    <header className="border-b border-pcg-border pb-8 sm:pb-10">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-pcg-primary">
        {label}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-pcg-ink sm:text-4xl">
        {department.name}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-pcg-text-secondary sm:text-lg">
        {department.shortDescription}
      </p>
    </header>
  );
}
