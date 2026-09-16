export function AdminGateMessage() {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="rounded-pcg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
      <p className="font-semibold">Convex non configurato</p>
      {isProd ? (
        <div className="mt-2 space-y-2 leading-relaxed">
          <p>
            Nell’ambiente di produzione manca la variabile{" "}
            <code className="rounded bg-white px-1">NEXT_PUBLIC_CONVEX_URL</code>.
          </p>
          <p>
            Impostala nel pannello del hosting (Settings → Environment
            Variables) con l’URL del deployment Convex di production, poi
            riesegui il deploy del frontend.
          </p>
        </div>
      ) : (
        <p className="mt-2 leading-relaxed">
          Imposta <code className="rounded bg-white px-1">NEXT_PUBLIC_CONVEX_URL</code>{" "}
          e avvia <code className="rounded bg-white px-1">npx convex dev</code>, poi
          esegui il seed. Le pagine pubbliche continuano a funzionare con i mock
          finché Convex non è collegato.
        </p>
      )}
    </div>
  );
}
