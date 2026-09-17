"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

/**
 * Invisible Staff comb junction.
 * Edges enter from the left (bus) and leave downward along the riser;
 * stubs reach member cards on the outside (right).
 */
function OrgHubNodeComponent() {
  return (
    <div
      className="pointer-events-none h-px w-px overflow-visible"
      aria-hidden
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1 !w-1 !min-h-0 !min-w-0 !border-pcg-border !bg-pcg-border"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1 !w-1 !min-h-0 !min-w-0 !border-pcg-border !bg-pcg-border"
      />
    </div>
  );
}

export const OrgHubNode = memo(OrgHubNodeComponent);
