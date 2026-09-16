import type { Metadata } from "next";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin · PCG People",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full bg-pcg-bg-subtle">
      <AdminHeader />
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <AdminNavigation />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <p className="border-t border-pcg-border px-4 py-4 text-center text-xs text-pcg-text-muted">
        Area Admin — non production-ready finché non è attiva l’autenticazione.
      </p>
    </div>
  );
}
