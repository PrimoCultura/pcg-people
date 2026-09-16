"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { OrgGroupNodeData } from "@/lib/organizationTree";

/**
 * Virtual org-chart label (Linea / Staff / department).
 * Not a person — not clickable, not persisted.
 */
function OrgGroupNodeComponent({ data }: NodeProps) {
  const node = data as OrgGroupNodeData;
  const isDepartment = node.kind === "department";
  const isStaff = node.kind === "staff";

  return (
    <div
      className={[
        "flex items-center justify-center px-2 py-1",
        isDepartment ? "w-[140px]" : "w-[160px]",
      ].join(" ")}
      aria-hidden
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-pcg-border-strong !bg-pcg-border-strong"
      />
      <span
        className={[
          "text-center font-semibold",
          isDepartment
            ? "text-[0.7rem] font-medium tracking-wide text-pcg-text-secondary"
            : isStaff
              ? "text-[0.6rem] uppercase tracking-[0.14em] text-pcg-text-muted"
              : "text-[0.65rem] uppercase tracking-[0.14em] text-pcg-text-muted",
        ].join(" ")}
      >
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
