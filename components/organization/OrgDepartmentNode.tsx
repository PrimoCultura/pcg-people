"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { OrgDepartmentNodeData } from "@/lib/organizationTree";

/**
 * Clickable virtual department in the Staff band (e.g. Cultura).
 * Navigation via ReactFlow onNodeClick (kind === "department").
 */
function OrgDepartmentNodeComponent({ data }: NodeProps) {
  const node = data as OrgDepartmentNodeData;

  return (
    <div
      className="nodrag nopan group flex w-[180px] cursor-pointer flex-col rounded-pcg border border-pcg-border bg-pcg-bg px-3 py-2.5 text-left transition-colors hover:border-pcg-primary hover:bg-pcg-bg-subtle"
      style={{ pointerEvents: "auto" }}
      role="presentation"
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-pcg-ink group-hover:text-pcg-primary">
            {node.label}
          </span>
          <span className="mt-0.5 block text-[0.65rem] font-medium uppercase tracking-wider text-pcg-text-muted">
            Dipartimento
          </span>
        </span>
        <span
          aria-hidden
          className="shrink-0 text-sm text-pcg-primary transition-transform group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>
    </div>
  );
}

export const OrgDepartmentNode = memo(OrgDepartmentNodeComponent);
