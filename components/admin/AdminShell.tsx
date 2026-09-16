"use client";

import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { ADMIN_LOGIN_PATH } from "@/lib/adminAuth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === ADMIN_LOGIN_PATH;

  if (isLogin) {
    return <div className="min-h-full bg-pcg-bg-subtle">{children}</div>;
  }

  return (
    <div className="min-h-full bg-pcg-bg-subtle">
      <AdminHeader />
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <AdminNavigation />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <p className="border-t border-pcg-border px-4 py-4 text-center text-xs text-pcg-text-muted">
        Area Admin protetta da password temporanea — sostituire con autenticazione
        completa.
      </p>
    </div>
  );
}
