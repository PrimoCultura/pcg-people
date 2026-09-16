"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { OrgGroupNodeData } from "@/lib/organizationTree";

/**
 * Virtual org-chart label (Direzioni / Staff).
 * Not a person — not clickable, not persisted.
 */
function OrgGroupNodeComponent({ data }: NodeProps) {
  const node = data as OrgGroupNodeData;

  return (
    <div
      className="flex w-[160px] items-center justify-center px-2 py-1"
      aria-hidden
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-pcg-border-strong !bg-pcg-border-strong"
      />
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
        {node.label}
      </span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-pcg-border-strong !bg-pcg-border-strong"
      />
    </div>
  );
}

export const OrgGroupNode = memo(OrgGroupNodeComponent);
