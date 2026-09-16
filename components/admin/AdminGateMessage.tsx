export function AdminGateMessage() {
  return (
    <div className="rounded-pcg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
      <p className="font-semibold">Convex non configurato</p>
      <p className="mt-2 leading-relaxed">
        Imposta <code className="rounded bg-white px-1">NEXT_PUBLIC_CONVEX_URL</code>{" "}
        e avvia <code className="rounded bg-white px-1">npx convex dev</code>, poi
        esegui il seed. Le pagine pubbliche continuano a funzionare con i mock
        finché Convex non è collegato.
      </p>
    </div>
  );
}
