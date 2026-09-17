"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { PersonOrgNode } from "@/components/organization/PersonOrgNode";
import type { Department } from "@/data/department";
import { getPersonFullName, type Person } from "@/data/types";
import {
  buildDepartmentFocusGraph,
  getDepartmentFocusCollapsibleIds,
  getDepartmentFocusDefaultCollapsed,
} from "@/lib/departmentOrganizationTree";
import { getLayoutedElements } from "@/lib/organizationLayout";
import type { PersonOrgNodeData } from "@/lib/organizationTree";

const nodeTypes = {
  person: PersonOrgNode,
} satisfies NodeTypes;

type DepartmentFocusFlowProps = {
  department: Department;
  people: Person[];
  departments: Department[];
};

function DepartmentFocusFlowInner({
  department,
  people,
  departments,
}: DepartmentFocusFlowProps) {
  const router = useRouter();
  const { fitView } = useReactFlow();
  const defaultCollapsed = useMemo(
    () => getDepartmentFocusDefaultCollapsed(department, people, departments),
    [department, people, departments],
  );
  const [collapsedOverride, setCollapsedOverride] = useState<Set<string> | null>(
    null,
  );
  const collapsed = collapsedOverride ?? defaultCollapsed;

  const { nodes, edges, head } = useMemo(() => {
    const graph = buildDepartmentFocusGraph(
      department,
      collapsed,
      people,
      departments,
    );
    const layouted = getLayoutedElements(graph.nodes, graph.edges);
    return {
      ...layouted,
      head: graph.head,
    };
  }, [department, collapsed, people, departments]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const frame = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 220 });
    });
    return () => cancelAnimationFrame(frame);
  }, [nodes, edges, fitView]);

  const toggleExpand = useCallback(
    (nodeId: string) => {
      const collapsible = getDepartmentFocusCollapsibleIds(
        department,
        people,
        departments,
      );
      if (!collapsible.has(nodeId)) return;
      setCollapsedOverride((prev) => {
        const base = prev ?? defaultCollapsed;
        const next = new Set(base);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
    },
    [department, people, departments, defaultCollapsed],
  );

  const expandAll = useCallback(() => {
    setCollapsedOverride(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedOverride(
      getDepartmentFocusCollapsibleIds(department, people, departments),
    );
  }, [department, people, departments]);

  const openProfile = useCallback(
    (personId: string) => {
      router.push(`/persone/${personId}`);
    },
    [router],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node: Node) => {
      const kind = (node.data as { kind?: string } | undefined)?.kind;
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
      toggleExpand,
      openAreaManager: () => undefined,
      openProfile,
      openDepartment: () => undefined,
    }),
    [toggleExpand, openProfile],
  );

  if (!head || nodes.length === 0) {
    return (
      <div className="mt-4 overflow-hidden rounded-pcg border border-pcg-border bg-pcg-bg">
        <ChartBackBar />
        <p className="px-4 py-6 text-sm text-pcg-text-secondary">
          Nessuna struttura da mostrare per questo dipartimento. Verifica che
          sia assegnato un responsabile.
        </p>
      </div>
    );
  }

  return (
    <OrganizationFlowProvider value={actions}>
      <div className="mt-4 space-y-3">
        <OrganizationControls
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />
        <div className="overflow-hidden rounded-pcg border border-pcg-border bg-pcg-bg">
          <ChartBackBar />
          <div className="pcg-org-flow relative h-[min(70vh,640px)] min-h-[420px] w-full border-t border-pcg-border">
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

function ChartBackBar() {
  return (
    <div className="flex items-center border-b border-pcg-border bg-pcg-bg-subtle px-3 py-2.5 sm:px-4">
      <Link
        href="/organizzazione?vista=dipartimenti"
        className="inline-flex items-center gap-1.5 rounded-pcg border border-pcg-border bg-pcg-bg px-3 py-1.5 text-sm font-medium text-pcg-primary transition-colors hover:border-pcg-primary hover:bg-pcg-bg hover:text-pcg-primary-hover"
      >
        ← Torna all’organigramma
      </Link>
    </div>
  );
}

export function DepartmentFocusFlow(props: DepartmentFocusFlowProps) {
  return (
    <ReactFlowProvider>
      <DepartmentFocusFlowInner {...props} />
    </ReactFlowProvider>
  );
}

export function DepartmentFocusHeader({
  department,
  head,
}: {
  department: Department;
  head: Person | null;
}) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pcg-text-muted">
        Focus dipartimento
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-pcg-ink">
        {department.name}
      </h2>
      {head ? (
        <p className="mt-2 text-sm text-pcg-text-secondary">
          Responsabile:{" "}
          <Link
            href={`/persone/${head.id}`}
            className="font-medium text-pcg-primary hover:text-pcg-primary-hover"
          >
            {getPersonFullName(head)}
          </Link>
          <span className="text-pcg-text-muted"> · {head.role}</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-pcg-text-secondary">
          Responsabile non assegnato.
        </p>
      )}
    </div>
  );
}
