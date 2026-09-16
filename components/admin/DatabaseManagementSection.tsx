"use client";

import { useMemo, useState } from "react";
import { PURGE_CONFIRM_PHRASE } from "@/lib/adminAuth";

type DatabaseManagementSectionProps = {
  onPurged?: () => void;
};

function getConvexEnvironmentLabel(): string | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    if (host.includes(".convex.cloud")) {
      const deployment = host.replace(".convex.cloud", "");
      return deployment;
    }
    return host;
  } catch {
    return null;
  }
}

export function DatabaseManagementSection({
  onPurged,
}: DatabaseManagementSectionProps) {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const environmentLabel = useMemo(() => getConvexEnvironmentLabel(), []);
  const canSubmit =
    phrase === PURGE_CONFIRM_PHRASE && acknowledged && !pending;

  function resetDialog() {
    setPhrase("");
    setAcknowledged(false);
    setError(null);
    setPending(false);
  }

  function closeDialog() {
    if (pending) return;
    setOpen(false);
    resetDialog();
  }

  async function runPurge() {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmPhrase: phrase,
          acknowledged,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        console.error("[admin/purge] failed", data);
        setError(data.message ?? "Eliminazione non riuscita.");
        setPending(false);
        return;
      }
      setOpen(false);
      resetDialog();
      setToast("Database svuotato correttamente.");
      onPurged?.();
      window.setTimeout(() => setToast(null), 5000);
    } catch (err) {
      console.error("[admin/purge]", err);
      setError("Eliminazione non riuscita. Controlla la console per i dettagli.");
      setPending(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-pcg-ink">Gestione database</h3>
        <p className="mt-1 text-sm text-pcg-text-secondary">
          Operazioni straordinarie sul database Convex collegato.
        </p>
      </div>

      <div className="rounded-pcg border border-red-200 bg-red-50/60 p-5">
        <h4 className="text-base font-semibold text-red-950">
          Pulizia completa database
        </h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-red-900/90">
          Elimina definitivamente persone, dipartimenti, distretti, cliniche e
          immagini caricate. Usa questa funzione solo al termine della fase di
          test.
        </p>
        <button
          type="button"
          onClick={() => {
            resetDialog();
            setOpen(true);
          }}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-pcg border border-red-700 bg-white px-4 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
        >
          Svuota database
        </button>
      </div>

      {toast ? (
        <p
          className="rounded-pcg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-pcg-ink/40 p-4 sm:items-center"
          role="presentation"
          onClick={closeDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="purge-dialog-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-pcg border border-pcg-border bg-pcg-bg p-5 shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <h4
              id="purge-dialog-title"
              className="text-lg font-semibold text-pcg-ink"
            >
              Conferma pulizia database
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-pcg-text-secondary">
              Questa operazione eliminerà definitivamente tutti i dati presenti
              nel database e non può essere annullata.
            </p>

            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-pcg-text">
              <li>Persone</li>
              <li>Dipartimenti</li>
              <li>Distretti</li>
              <li>Cliniche</li>
              <li>Foto profilo e relativi file Convex Storage</li>
              <li>Dati tecnici di seed/meta relativi ai dati demo</li>
            </ul>

            <div className="mt-4 rounded-pcg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {environmentLabel ? (
                <p>
                  Ambiente collegato:{" "}
                  <span className="font-semibold">{environmentLabel}</span>
                </p>
              ) : (
                <p>Ambiente collegato: non determinabile in modo affidabile.</p>
              )}
              <p className="mt-1 text-amber-900/90">
                Controlla di essere nell’ambiente corretto prima di procedere.
              </p>
            </div>

            <label className="mt-5 block text-sm font-medium text-pcg-ink">
              Digita{" "}
              <span className="font-semibold tracking-wide">
                {PURGE_CONFIRM_PHRASE}
              </span>{" "}
              per confermare
              <input
                type="text"
                value={phrase}
                onChange={(event) => setPhrase(event.target.value)}
                disabled={pending}
                autoComplete="off"
                className="mt-1.5 h-11 w-full rounded-pcg border border-pcg-border bg-pcg-bg px-3 font-mono text-sm text-pcg-text outline-none focus:border-red-700 disabled:opacity-60"
              />
            </label>

            <label className="mt-4 flex items-start gap-2 text-sm text-pcg-text">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                disabled={pending}
                className="mt-1"
              />
              <span>Confermo di voler eliminare tutti i dati presenti.</span>
            </label>

            {error ? (
              <p className="mt-4 text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            {pending ? (
              <p className="mt-4 text-sm font-medium text-pcg-text-secondary">
                Eliminazione in corso…
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeDialog}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-pcg border border-pcg-border px-4 text-sm font-medium text-pcg-text disabled:opacity-50"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={runPurge}
                disabled={!canSubmit}
                className="inline-flex h-10 items-center rounded-pcg border border-red-800 bg-red-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Elimina definitivamente
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
