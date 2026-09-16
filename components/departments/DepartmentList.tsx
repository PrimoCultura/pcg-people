import Link from "next/link";
import type { Department } from "@/data/department";
import { getPersonFullName, type Person } from "@/data/types";

type DepartmentListProps = {
  departments: Department[];
  people?: Person[];
};

export function DepartmentList({
  departments,
  people = [],
}: DepartmentListProps) {
  const byId = new Map(people.map((p) => [p.id, p]));

  return (
    <ul className="mt-10 border-t border-pcg-border sm:mt-12">
      {departments.map((department, index) => (
        <DepartmentListItem
          key={department.id}
          department={department}
          index={index + 1}
          head={
            department.headId ? byId.get(department.headId) : undefined
          }
        />
      ))}
    </ul>
  );
}

type DepartmentListItemProps = {
  department: Department;
  index: number;
  head?: Person;
};

function DepartmentListItem({
  department,
  index,
  head,
}: DepartmentListItemProps) {
  const mark = String(index).padStart(2, "0");

  return (
    <li className="border-b border-pcg-border">
      <Link
        href={`/dipartimenti/${department.id}`}
        className="group flex flex-col gap-3 px-1 py-7 transition-colors hover:bg-pcg-bg-subtle focus-visible:bg-pcg-bg-subtle sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-4 sm:py-8"
      >
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium tracking-[0.16em] text-pcg-text-muted">
            {mark}
          </span>
          <span className="mt-2 flex items-baseline justify-between gap-4 sm:justify-start">
            <span className="text-xl font-semibold text-pcg-ink transition-colors group-hover:text-pcg-primary sm:text-2xl">
              {department.name}
            </span>
            <span
              aria-hidden
              className="text-pcg-primary transition-transform duration-200 group-hover:translate-x-1 sm:hidden"
            >
              →
            </span>
          </span>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-pcg-text-secondary sm:text-base">
            {department.shortDescription}
          </p>
          {head ? (
            <p className="mt-3 text-sm text-pcg-text-muted">
              Responsabile:{" "}
              <span className="text-pcg-text-secondary">
                {getPersonFullName(head)}
              </span>
            </p>
          ) : null}
        </div>
        <span
          aria-hidden
          className="hidden shrink-0 pt-8 text-pcg-primary transition-transform duration-200 group-hover:translate-x-1 sm:inline"
        >
          →
        </span>
      </Link>
    </li>
  );
}
