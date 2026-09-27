"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useOrganizationFlowActions } from "@/components/organization/OrganizationFlowContext";
import type { OrgTeamNodeData } from "@/lib/organizationTree";

/**
 * Organizational team container (not a person).
 * Card / + expands members; distinct from person nodes.
 */
function OrgTeamNodeComponent({
  id,
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) {
  const { toggleExpand } = useOrganizationFlowActions();
  const node = data as OrgTeamNodeData;

  return (
    <div
      className="nodrag nopan group flex w-[210px] cursor-pointer flex-col rounded-pcg border-2 border-pcg-border bg-pcg-bg-subtle px-3 py-2.5 text-left transition-colors hover:border-pcg-primary"
      style={{ pointerEvents: "auto" }}
      tabIndex={0}
      role="button"
      aria-expanded={node.isExpanded}
      aria-label={`${node.isExpanded ? "Comprimi" : "Espandi"} team ${node.label}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (node.canCollapse) toggleExpand(id);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        if (node.canCollapse) toggleExpand(id);
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
            Team
          </span>
          {node.headLabel ? (
            <span className="mt-1 block truncate text-xs text-pcg-text-secondary">
              Responsabile: {node.headLabel}
            </span>
          ) : null}
          <span className="mt-0.5 block text-xs text-pcg-text-muted">
            {node.memberCount}{" "}
            {node.memberCount === 1 ? "membro" : "membri"}
          </span>
        </span>

        {node.canCollapse ? (
          <button
            type="button"
            className="nodrag nopan inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-pcg border border-pcg-border text-sm text-pcg-primary hover:bg-pcg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pcg-focus"
            aria-expanded={node.isExpanded}
            aria-label={
              node.isExpanded
                ? `Comprimi il team ${node.label}`
                : `Espandi il team ${node.label}`
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

export const OrgTeamNode = memo(OrgTeamNodeComponent);
