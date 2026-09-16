"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Password non corretta.");
        return;
      }
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/admin") && !next.startsWith("/admin/login")
          ? next
          : "/admin";
      router.replace(target);
      router.refresh();
    } catch (err) {
      console.error("[admin/login]", err);
      setError("Accesso non riuscito. Riprova.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-pcg border border-pcg-border bg-pcg-bg p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pcg-primary">
        {siteConfig.appName}
      </p>
      <h1 className="mt-2 text-xl font-semibold text-pcg-ink">Accesso Admin</h1>
      <p className="mt-2 text-sm text-pcg-text-secondary">
        Inserisci la password temporanea per continuare.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="admin-password"
            className="block text-sm font-medium text-pcg-ink"
          >
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 text-pcg-text outline-none focus:border-pcg-primary"
            required
            disabled={pending}
          />
        </div>

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || password.length === 0}
          className="inline-flex h-11 w-full items-center justify-center rounded-pcg bg-pcg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-pcg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Accesso…" : "Entra"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <p className="text-sm text-pcg-text-secondary">Caricamento…</p>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
