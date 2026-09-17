"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react";
import { OrganizationControls } from "@/components/organization/OrganizationControls";
import { OrganizationFlowProvider } from "@/components/organization/OrganizationFlowContext";
import { OrgDepartmentNode } from "@/components/organization/OrgDepartmentNode";
import { OrgHubNode } from "@/components/organization/OrgHubNode";
import { OrgLabelNode } from "@/components/organization/OrgLabelNode";
import { PersonOrgNode } from "@/components/organization/PersonOrgNode";
import type { Department } from "@/data/department";
import type { Person } from "@/data/types";
import { buildDepartmentOverviewGraph } from "@/lib/departmentOrganizationTree";
import { getLayoutedElements } from "@/lib/organizationLayout";
import type {
  OrgDepartmentNodeData,
  PersonOrgNodeData,
} from "@/lib/organizationTree";

const nodeTypes = {
  person: PersonOrgNode,
  department: OrgDepartmentNode,
  label: OrgLabelNode,
  hub: OrgHubNode,
} satisfies NodeTypes;

type DepartmentOverviewFlowProps = {
  people: Person[];
  departments: Department[];
};

function DepartmentOverviewFlowInner({
  people,
  departments,
}: DepartmentOverviewFlowProps) {
  const router = useRouter();
  const { fitView } = useReactFlow();

  const { nodes, edges, status } = useMemo(() => {
    const graph = buildDepartmentOverviewGraph(people, departments);
    const layouted = getLayoutedElements(graph.nodes, graph.edges);
    return {
      ...layouted,
      status: graph.status,
    };
  }, [people, departments]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const frame = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 220 });
    });
    return () => cancelAnimationFrame(frame);
  }, [nodes, edges, fitView]);

  const openProfile = useCallback(
    (personId: string) => {
      router.push(`/persone/${personId}`);
    },
    [router],
  );

  const openDepartment = useCallback(
    (departmentId: string) => {
      router.push(`/organizzazione/dipartimenti/${departmentId}`);
    },
    [router],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node: Node) => {
      const kind = (node.data as { kind?: string } | undefined)?.kind;
      if (kind === "label" || kind === "hub") return;
      if (kind === "department") {
        const data = node.data as OrgDepartmentNodeData;
        if (!data.departmentId) return;
        router.push(`/organizzazione/dipartimenti/${data.departmentId}`);
        return;
      }
      if (kind === "person" || node.type === "person") {
        const data = node.data as PersonOrgNodeData;
        if (!data?.personId) return;
        router.push(`/persone/${data.personId}`);
      }
    },
    [router],
  );

  const actions = useMemo(
    () => ({
      toggleExpand: () => undefined,
      openAreaManager: () => undefined,
      openProfile,
      openDepartment,
    }),
    [openProfile, openDepartment],
  );

  if (status !== "ok" || nodes.length === 0) {
    return (
      <p className="mt-4 text-sm text-pcg-text-secondary">
        {status === "missing-root"
          ? "Vertice CEO non configurato: assegna un responsabile al dipartimento CEO."
          : "Dipartimento/funzione CEO non trovato. Crea un dipartimento con slug «ceo» oppure configura il vertice dell’organigramma."}
      </p>
    );
  }

  return (
    <OrganizationFlowProvider value={actions}>
      <div className="mt-4 space-y-3">
        <OrganizationControls
          onExpandAll={() => undefined}
          onCollapseAll={() => undefined}
        />
        <div className="overflow-hidden rounded-pcg border border-pcg-border bg-pcg-bg">
          <div className="pcg-org-flow relative h-[min(70vh,640px)] min-h-[420px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              edgesFocusable={false}
              nodesFocusable
              deleteKeyCode={null}
              panOnDrag
              zoomOnScroll
              zoomOnPinch
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.35}
              maxZoom={1.6}
              proOptions={{ hideAttribution: false }}
            />
          </div>
        </div>
      </div>
    </OrganizationFlowProvider>
  );
}

export function DepartmentOverviewFlow(props: DepartmentOverviewFlowProps) {
  return (
    <ReactFlowProvider>
      <DepartmentOverviewFlowInner {...props} />
    </ReactFlowProvider>
  );
}
