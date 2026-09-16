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
import { AreaManagerDetails } from "@/components/organization/AreaManagerDetails";
import { OrganizationControls } from "@/components/organization/OrganizationControls";
import { OrganizationFlowProvider } from "@/components/organization/OrganizationFlowContext";
import { PersonOrgNode } from "@/components/organization/PersonOrgNode";
import type { Clinic } from "@/data/clinic";
import { getPersonFullName, type Person } from "@/data/types";
import { getLayoutedElements } from "@/lib/organizationLayout";
import {
  buildOrganizationGraph,
  getAllCollapsibleIds,
  getDefaultCollapsedIds,
  type OrgMode,
  type OrgRootStatus,
  type PersonOrgNodeData,
} from "@/lib/organizationTree";

const nodeTypes = {
  person: PersonOrgNode,
} satisfies NodeTypes;

type OrganizationFlowProps = {
  mode: OrgMode;
  people: Person[];
  clinics?: Clinic[];
};

function OrganizationFlowInner({
  mode,
  people,
  clinics = [],
}: OrganizationFlowProps) {
  const router = useRouter();
  const { fitView } = useReactFlow();
  const [collapsed, setCollapsed] = useState<Set<string>>(() =>
    getDefaultCollapsedIds(mode, people),
  );
  const [selectedAmId, setSelectedAmId] = useState<string | null>(null);

  const { nodes, edges, status, orphans } = useMemo(() => {
    const graph = buildOrganizationGraph(mode, collapsed, people, clinics);
    const layouted = getLayoutedElements(graph.nodes, graph.edges);
    return {
      ...layouted,
      status: graph.status,
      orphans: graph.orphans,
    };
  }, [mode, collapsed, people, clinics]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const frame = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 220 });
    });
    return () => cancelAnimationFrame(frame);
  }, [nodes, edges, fitView]);

  const toggleExpand = useCallback((personId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsed(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsed(getAllCollapsibleIds(mode, people));
  }, [mode, people]);

  const openAreaManager = useCallback((personId: string) => {
    setSelectedAmId(personId);
  }, []);

  const openProfile = useCallback(
    (personId: string) => {
      router.push(`/persone/${personId}`);
    },
    [router],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node: Node) => {
      const data = node.data as PersonOrgNodeData;
      if (!data?.personId) return;
      openProfile(data.personId);
    },
    [openProfile],
  );

  const actions = useMemo(
    () => ({
      toggleExpand,
      openAreaManager,
      openProfile,
    }),
    [toggleExpand, openAreaManager, openProfile],
  );

  const selectedPerson = selectedAmId
    ? (people.find((p) => p.id === selectedAmId) ?? null)
    : null;
  const selectedClinics = selectedAmId
    ? clinics.filter((c) => c.areaManagerId === selectedAmId)
    : [];

  const showDiagram = nodes.length > 0;
  const isOrgView = mode === "organization";

  return (
    <OrganizationFlowProvider value={actions}>
      <div className="mt-4 space-y-3">
        {isOrgView ? <OrgRootWarning status={status} /> : null}

        {showDiagram ? (
          <>
            <OrganizationControls
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
            />

            <div className="overflow-hidden rounded-pcg border border-pcg-border bg-pcg-bg">
              <div className="flex flex-col lg:flex-row">
                <div className="pcg-org-flow relative h-[min(70vh,640px)] min-h-[420px] w-full flex-1">
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

                {selectedPerson ? (
                  <AreaManagerDetails
                    person={selectedPerson}
                    clinics={selectedClinics}
                    onClose={() => setSelectedAmId(null)}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : isOrgView && status === "ok" ? (
          <p className="text-sm text-pcg-text-secondary">
            Nessuna persona da visualizzare nell’organigramma.
          </p>
        ) : null}

        {isOrgView && orphans.length > 0 ? (
          <IncompleteOrgData people={orphans} />
        ) : null}
      </div>
    </OrganizationFlowProvider>
  );
}

function OrgRootWarning({ status }: { status: OrgRootStatus }) {
  if (status === "ok") return null;
  const message =
    status === "multiple"
      ? "Più vertici dell’organigramma configurati."
      : "Vertice dell’organigramma non configurato.";
  return (
    <p
      className="rounded-pcg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
      role="status"
    >
      {message}
    </p>
  );
}

function IncompleteOrgData({ people }: { people: Person[] }) {
  return (
    <section
      className="border-t border-pcg-border pt-6"
      aria-labelledby="org-incomplete-heading"
    >
      <h3
        id="org-incomplete-heading"
        className="text-sm font-medium text-pcg-text-secondary"
      >
        Dati organizzativi da completare
      </h3>
      <ul className="mt-3 space-y-3">
        {people.map((person) => (
          <li key={person.id} className="text-sm">
            <Link
              href={`/persone/${person.id}`}
              className="font-medium text-pcg-primary hover:text-pcg-primary-hover"
            >
              {getPersonFullName(person)}
            </Link>
            <span className="text-pcg-text-secondary"> — {person.role}</span>
            <p className="mt-0.5 text-xs text-pcg-text-muted">
              Responsabile diretto non assegnato.
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OrganizationFlow(props: OrganizationFlowProps) {
  return (
    <ReactFlowProvider>
      <OrganizationFlowInner {...props} />
    </ReactFlowProvider>
  );
}
