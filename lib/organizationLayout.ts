import type { Edge, Node } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { graphlib, layout as dagreLayout } from "@dagrejs/dagre";

const PERSON_NODE_WIDTH = 220;
const PERSON_NODE_HEIGHT = 112;
const DEPT_NODE_WIDTH = 200;
const DEPT_NODE_HEIGHT = 72;
const HUB_SIZE = 1;
const LABEL_WIDTH = 100;
const LABEL_HEIGHT = 18;
const BAND_GAP = 72;
const STAFF_GAP_Y = 20;
const STAFF_OFFSET_X = 72;
const STAFF_STUB = 36;
const STAFF_BUS_Y = 28;

export type LayoutOptions = {
  direction?: "TB" | "LR";
  nodesep?: number;
  ranksep?: number;
};

function sizeForNode(node: Node): { width: number; height: number } {
  if (node.type === "hub") return { width: HUB_SIZE, height: HUB_SIZE };
  if (node.type === "label") return { width: LABEL_WIDTH, height: LABEL_HEIGHT };
  if (node.type === "department") {
    return { width: DEPT_NODE_WIDTH, height: DEPT_NODE_HEIGHT };
  }
  return { width: PERSON_NODE_WIDTH, height: PERSON_NODE_HEIGHT };
}

function collectDescendants(rootId: string, edges: Edge[]): Set<string> {
  const children = new Map<string, string[]>();
  for (const edge of edges) {
    const list = children.get(edge.source) ?? [];
    list.push(edge.target);
    children.set(edge.source, list);
  }
  const out = new Set<string>();
  const stack = [rootId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    for (const child of children.get(id) ?? []) stack.push(child);
  }
  return out;
}

/**
 * Staff comb (right side):
 * label above horizontal bus → vertical riser (hub) near the chart →
 * short stubs outward → person/department cards on the outside.
 */
function applyStaffCombLayout<N extends Node, E extends Edge>(
  nodes: N[],
  edges: E[],
): N[] {
  const byId = new Map(nodes.map((n) => [n.id, { ...n }]));
  const childrenOf = new Map<string, string[]>();
  for (const edge of edges) {
    const list = childrenOf.get(edge.source) ?? [];
    list.push(edge.target);
    childrenOf.set(edge.source, list);
  }

  for (const node of nodes) {
    if (node.type !== "hub") continue;
    const hubData = node.data as { parentPersonId?: string };
    const managerId = hubData.parentPersonId;
    if (!managerId) continue;
    const manager = byId.get(managerId);
    if (!manager) continue;

    const memberIds = (childrenOf.get(node.id) ?? []).filter((id) => {
      const n = byId.get(id);
      return n && (n.type === "person" || n.type === "department");
    });

    const managerSize = sizeForNode(manager);
    const busY = manager.position.y + managerSize.height + STAFF_BUS_Y;
    // Montante vicino all'organigramma (lato interno del pettine).
    const hubX = manager.position.x + managerSize.width + STAFF_OFFSET_X;
    const hubY = busY;

    byId.set(node.id, {
      ...node,
      position: { x: hubX, y: hubY },
      targetPosition: Position.Left,
      sourcePosition: Position.Bottom,
    });

    const labelId = `staff-label-${managerId}`;
    const label = byId.get(labelId);
    if (label) {
      byId.set(labelId, {
        ...label,
        position: {
          x: hubX,
          y: hubY - LABEL_HEIGHT - 8,
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      });
    }

    let cursorY = hubY + 28;
    for (const id of memberIds) {
      const n = byId.get(id)!;
      const { width, height } = sizeForNode(n);
      // Stub verso l'esterno: card a destra del montante.
      const memberX = hubX + STAFF_STUB;
      const memberY = cursorY;
      const oldPos = n.position;
      const dx = memberX - oldPos.x;
      const dy = memberY - oldPos.y;

      byId.set(id, {
        ...n,
        position: { x: memberX, y: memberY },
        targetPosition: Position.Left,
        sourcePosition: Position.Bottom,
      });

      if (dx !== 0 || dy !== 0) {
        for (const desc of collectDescendants(id, edges)) {
          if (desc === id) continue;
          const d = byId.get(desc);
          if (!d) continue;
          byId.set(desc, {
            ...d,
            position: {
              x: d.position.x + dx,
              y: d.position.y + dy,
            },
          });
        }
      }

      // After placing this member, reserve vertical space for its expanded subtree.
      let subtreeBottom = memberY + height;
      for (const desc of collectDescendants(id, edges)) {
        if (desc === id) continue;
        const d = byId.get(desc);
        if (!d) continue;
        const size = sizeForNode(d);
        subtreeBottom = Math.max(subtreeBottom, d.position.y + size.height);
      }
      cursorY = subtreeBottom + STAFF_GAP_Y;
      void width;
    }
  }

  // Push line-report subtrees below the staff comb.
  const yShift = new Map<string, number>();
  for (const node of nodes) {
    if (node.type !== "hub") continue;
    const hubData = node.data as { parentPersonId?: string };
    const managerId = hubData.parentPersonId;
    if (!managerId) continue;
    const hub = byId.get(node.id);
    if (!hub) continue;

    const staffIds = collectDescendants(node.id, edges);
    staffIds.add(node.id);
    staffIds.add(`staff-label-${managerId}`);

    let staffMaxBottom = hub.position.y + HUB_SIZE;
    for (const id of staffIds) {
      const n = byId.get(id);
      if (!n) continue;
      const { height } = sizeForNode(n);
      staffMaxBottom = Math.max(staffMaxBottom, n.position.y + height);
    }

    const lineRoots: string[] = [];
    for (const edge of edges) {
      if (edge.source !== managerId) continue;
      if (edge.target === node.id) continue;
      lineRoots.push(edge.target);
    }

    const lineIds = new Set<string>();
    for (const root of lineRoots) {
      for (const id of collectDescendants(root, edges)) {
        if (!staffIds.has(id)) lineIds.add(id);
      }
    }
    if (lineIds.size === 0) continue;

    let lineMinTop = Infinity;
    for (const id of lineIds) {
      const n = byId.get(id);
      if (!n) continue;
      lineMinTop = Math.min(lineMinTop, n.position.y);
    }
    if (!Number.isFinite(lineMinTop)) continue;

    const delta = staffMaxBottom + BAND_GAP - lineMinTop;
    if (delta <= 0) continue;
    for (const id of lineIds) {
      yShift.set(id, (yShift.get(id) ?? 0) + delta);
    }
  }

  return nodes.map((node) => {
    const positioned = byId.get(node.id) ?? node;
    const dy = yShift.get(node.id) ?? 0;
    if (!dy) return positioned;
    return {
      ...positioned,
      position: {
        ...positioned.position,
        y: positioned.position.y + dy,
      },
    };
  });
}

export function getLayoutedElements<
  N extends Node = Node,
  E extends Edge = Edge,
>(
  nodes: N[],
  edges: E[],
  options: LayoutOptions = {},
): { nodes: N[]; edges: E[] } {
  const direction = options.direction ?? "TB";
  const isHorizontal = direction === "LR";

  const graph = new graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: options.nodesep ?? 40,
    ranksep: options.ranksep ?? 56,
    marginx: 24,
    marginy: 24,
  });

  for (const node of nodes) {
    // Labels are decorative and placed in the comb pass.
    if (node.type === "label") continue;
    const { width, height } = sizeForNode(node);
    graph.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    if (source?.type === "label" || target?.type === "label") continue;
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
    graph.setEdge(edge.source, edge.target);
  }

  dagreLayout(graph);

  const layoutedNodes = nodes.map((node) => {
    if (node.type === "label") {
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: node.position,
      };
    }
    const position = graph.node(node.id);
    if (!position) {
      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      };
    }
    const { width, height } = sizeForNode(node);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: position.x - width / 2,
        y: position.y - height / 2,
      },
    };
  });

  return {
    nodes: applyStaffCombLayout(layoutedNodes, edges),
    edges,
  };
}

export const ORG_NODE_WIDTH = PERSON_NODE_WIDTH;
export const ORG_NODE_HEIGHT = PERSON_NODE_HEIGHT;
