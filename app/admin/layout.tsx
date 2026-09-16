import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

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
    <Suspense fallback={<div className="min-h-full bg-pcg-bg-subtle" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
