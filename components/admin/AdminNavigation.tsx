"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: Array<{
  href: string;
  label: string;
  exact?: boolean;
}> = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/persone", label: "Persone" },
  { href: "/admin/dipartimenti", label: "Dipartimenti" },
  { href: "/admin/distretti", label: "Distretti" },
  { href: "/admin/cliniche", label: "Cliniche" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden w-44 shrink-0 sm:block"
      aria-label="Navigazione admin"
    >
      <ul className="space-y-1">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={[
                  "block rounded-pcg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-pcg-primary-soft text-pcg-primary"
                    : "text-pcg-text-secondary hover:bg-pcg-bg hover:text-pcg-primary",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
