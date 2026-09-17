"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useOrganizationFlowActions } from "@/components/organization/OrganizationFlowContext";
import type { OrgDepartmentNodeData } from "@/lib/organizationTree";

/**
 * Clickable staff department card (e.g. Cultura).
 * Card click → department page; `+` → expand/collapse inner structure.
 */
function OrgDepartmentNodeComponent({
  id,
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) {
  const { toggleExpand, openDepartment } = useOrganizationFlowActions();
  const node = data as OrgDepartmentNodeData;

  return (
    <div
      className="nodrag nopan group flex w-[200px] cursor-pointer flex-col rounded-pcg border border-pcg-border bg-pcg-bg px-3 py-2.5 text-left transition-colors hover:border-pcg-primary hover:bg-pcg-bg-subtle"
      style={{ pointerEvents: "auto" }}
      tabIndex={0}
      role="link"
      aria-label={`Apri dipartimento ${node.label}`}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        openDepartment(node.departmentId);
      }}
    >
      <Handle type="target" position={targetPosition} />
      <Handle type="source" position={sourcePosition} />

      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-pcg-ink group-hover:text-pcg-primary">
            {node.label}
          </span>
          <span className="mt-0.5 block text-[0.65rem] font-medium uppercase tracking-wider text-pcg-text-muted">
            Dipartimento
          </span>
        </span>

        {node.canCollapse ? (
          <button
            type="button"
            className="nodrag nopan inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-pcg border border-pcg-border text-sm text-pcg-primary hover:bg-pcg-bg-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pcg-focus"
            aria-expanded={node.isExpanded}
            aria-label={
              node.isExpanded
                ? `Comprimi la struttura di ${node.label}`
                : `Espandi la struttura di ${node.label}`
            }
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleExpand(id);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {node.isExpanded ? "−" : "+"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const OrgDepartmentNode = memo(OrgDepartmentNodeComponent);
