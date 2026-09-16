"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";

export function AdminHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("[admin/logout]", error);
      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-pcg-border bg-pcg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pcg-primary">
            {siteConfig.appName}
          </p>
          <h1 className="text-lg font-semibold text-pcg-ink">Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-pcg-primary hover:text-pcg-primary-hover"
          >
            ← Torna al sito
          </Link>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="text-sm font-medium text-pcg-text-secondary hover:text-pcg-ink disabled:opacity-50"
          >
            {loggingOut ? "Uscita…" : "Esci"}
          </button>
        </div>
      </div>
    </header>
  );
}
