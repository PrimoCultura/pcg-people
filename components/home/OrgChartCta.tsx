import Link from "next/link";

/**
 * Primary homepage entry to the org chart — equal weight with search.
 */
export function OrgChartCta() {
  return (
    <Link
      href="/organizzazione"
      className="group flex h-full flex-col rounded-pcg outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pcg-primary"
    >
      <h2 className="text-xl font-semibold tracking-tight text-pcg-ink transition-colors group-hover:text-pcg-primary sm:text-[1.35rem]">
        Esplora l’organigramma
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-pcg-text-secondary">
        Naviga la struttura di PCG, apri i team e scopri chi riporta a chi.
      </p>

      <div
        aria-hidden
        className="mt-6 flex flex-1 items-center justify-center rounded-pcg border border-pcg-border bg-pcg-bg-subtle/60 px-4 py-6 sm:mt-8 sm:py-8"
      >
        <OrgChartPreview />
      </div>

      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-pcg-primary transition-transform duration-200 group-hover:translate-x-1">
        Apri organigramma
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

/** Static decorative tree — not interactive. */
function OrgChartPreview() {
  return (
    <svg
      className="h-auto w-full max-w-[220px] text-pcg-primary sm:max-w-[260px]"
      viewBox="0 0 220 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Root */}
      <circle cx="110" cy="18" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="110" cy="18" r="3.5" fill="currentColor" opacity="0.2" />

      {/* Trunk to mid rail */}
      <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.35">
        <path d="M110 28V48" />
        <path d="M40 48h140" />
        <path d="M40 48v14M110 48v14M180 48v14" />
      </g>

      {/* Mid level */}
      <circle cx="40" cy="76" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="110" cy="76" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="180" cy="76" r="10" stroke="currentColor" strokeWidth="1.5" />

      {/* Branch under center mid */}
      <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.35">
        <path d="M110 86V104" />
        <path d="M85 104h50" />
        <path d="M85 104v14M135 104v14" />
      </g>
      {/* Leaves */}
      <circle cx="85" cy="128" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="135" cy="128" r="9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
