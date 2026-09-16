"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { OrgStaffLabelNodeData } from "@/lib/organizationTree";

/**
 * Thin Staff band title (e.g. "STAFF AD") — not a position, not clickable.
 */
function OrgGroupNodeComponent({ data }: NodeProps) {
  const node = data as OrgStaffLabelNodeData;

  return (
    <div className="flex w-[120px] flex-col items-center gap-1" aria-hidden>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1 !w-1 !min-h-0 !min-w-0 !border-pcg-border !bg-pcg-border"
      />
      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-pcg-text-muted">
        {node.label}
      </span>
      <span className="h-px w-10 bg-pcg-border-strong" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1 !w-1 !min-h-0 !min-w-0 !border-pcg-border !bg-pcg-border"
      />
    </div>
  );
}

export const OrgGroupNode = memo(OrgGroupNodeComponent);
