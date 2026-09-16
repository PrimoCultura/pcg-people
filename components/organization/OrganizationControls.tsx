"use client";

import { useReactFlow } from "@xyflow/react";

type OrganizationControlsProps = {
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

export function OrganizationControls({
  onExpandAll,
  onCollapseAll,
}: OrganizationControlsProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ControlButton
        label="Ingrandisci"
        onClick={() => zoomIn({ duration: 200 })}
      >
        Zoom +
      </ControlButton>
      <ControlButton
        label="Riduci"
        onClick={() => zoomOut({ duration: 200 })}
      >
        Zoom −
      </ControlButton>
      <ControlButton
        label="Centra organigramma"
        onClick={() => fitView({ padding: 0.2, duration: 280 })}
      >
        Centra organigramma
      </ControlButton>
      <span className="mx-1 hidden h-4 w-px bg-pcg-border sm:inline-block" aria-hidden />
      <ControlButton label="Espandi tutto" onClick={onExpandAll}>
        Espandi tutto
      </ControlButton>
      <ControlButton label="Comprimi" onClick={onCollapseAll}>
        Comprimi
      </ControlButton>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-pcg border border-pcg-border bg-pcg-bg px-3 py-1.5 text-xs font-medium text-pcg-text-secondary transition-colors hover:border-pcg-border-strong hover:text-pcg-primary"
    >
      {children}
    </button>
  );
}
