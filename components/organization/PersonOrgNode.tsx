"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { PersonAvatar } from "@/components/people/PersonAvatar";
import { useOrganizationFlowActions } from "@/components/organization/OrganizationFlowContext";
import type { PersonOrgNodeData } from "@/lib/organizationTree";

function PersonOrgNodeComponent({
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) {
  const { toggleExpand, openAreaManager, openProfile } =
    useOrganizationFlowActions();
  const node = data as PersonOrgNodeData;
  const fullName = `${node.firstName} ${node.lastName}`;

  return (
    <div
      className="nodrag nopan pcg-org-person-node w-[220px] cursor-pointer rounded-pcg border border-pcg-border bg-pcg-bg px-3 py-3 text-left shadow-none"
      style={{ pointerEvents: "auto" }}
      tabIndex={0}
      role="link"
      aria-label={`Apri profilo di ${fullName}`}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        openProfile(node.personId);
      }}
    >
      <Handle type="target" position={targetPosition} />
      <Handle type="source" position={sourcePosition} />

      <div className="flex gap-2">
        <div className="nodrag nopan flex min-w-0 flex-1 cursor-pointer gap-3">
          <span className="shrink-0" aria-hidden>
            <PersonAvatar
              person={{
                firstName: node.firstName,
                lastName: node.lastName,
                photoUrl: node.photoUrl,
              }}
              size="sm"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-pcg-ink">
              {fullName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-pcg-text-secondary">
              {node.role}
            </span>
            <span className="mt-1 block truncate text-[0.65rem] font-medium uppercase tracking-wider text-pcg-text-muted">
              {node.metaLabel}
            </span>
          </span>
        </div>

        {node.canCollapse ? (
          <button
            type="button"
            className="nodrag nopan inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center self-start rounded-pcg border border-pcg-border text-sm text-pcg-primary hover:bg-pcg-bg-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pcg-focus"
            aria-expanded={node.isExpanded}
            aria-label={
              node.isExpanded
                ? `Comprimi i riporti di ${fullName}`
                : `Espandi i riporti di ${fullName}`
            }
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleExpand(node.personId);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {node.isExpanded ? "−" : "+"}
          </button>
        ) : null}
      </div>

      {node.isAreaManager && typeof node.clinicCount === "number" ? (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-pcg-border pt-2">
          <span className="text-xs text-pcg-text-muted">
            {node.clinicCount}{" "}
            {node.clinicCount === 1 ? "clinica" : "cliniche"}
          </span>
          <button
            type="button"
            className="nodrag nopan cursor-pointer rounded-pcg-sm text-xs font-medium text-pcg-primary hover:text-pcg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pcg-focus"
            aria-label={`Mostra cliniche di ${fullName}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openAreaManager(node.personId);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            Dettaglio
          </button>
        </div>
      ) : null}
    </div>
  );
}

export const PersonOrgNode = memo(PersonOrgNodeComponent);
