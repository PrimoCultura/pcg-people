"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { OrgLabelNodeData } from "@/lib/organizationTree";

/**
 * Text-only Staff band title (e.g. "Staff AD") — not a card, not clickable.
 */
function OrgLabelNodeComponent({ data }: NodeProps) {
  const node = data as OrgLabelNodeData;

  return (
    <div
      className="pointer-events-none flex w-[100px] items-end justify-start"
      aria-hidden
    >
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
        {node.label}
      </span>
    </div>
  );
}

export const OrgLabelNode = memo(OrgLabelNodeComponent);
