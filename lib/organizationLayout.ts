import type { Edge, Node } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { graphlib, layout as dagreLayout } from "@dagrejs/dagre";

const PERSON_NODE_WIDTH = 220;
const PERSON_NODE_HEIGHT = 112;
const STAFF_LABEL_WIDTH = 120;
const STAFF_LABEL_HEIGHT = 22;
const DEPT_NODE_WIDTH = 180;
const DEPT_NODE_HEIGHT = 64;
const BAND_GAP = 56;

export type LayoutOptions = {
  direction?: "TB" | "LR";
  nodesep?: number;
  ranksep?: number;
};

function sizeForNode(node: Node): { width: number; height: number } {
  if (node.type === "group") {
    return { width: STAFF_LABEL_WIDTH, height: STAFF_LABEL_HEIGHT };
  }
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
 * After Dagre, push each manager's line-report subtree below their Staff band
 * so the visual order is: Manager → Staff AD → Directors.
 */
function stackLineBelowStaffBand<N extends Node, E extends Edge>(
  nodes: N[],
  edges: E[],
): N[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const yShift = new Map<string, number>();

  for (const node of nodes) {
    if (node.type !== "group") continue;
    const data = node.data as { kind?: string; parentPersonId?: string };
    if (data.kind !== "group" || !data.parentPersonId) continue;

    const staffIds = collectDescendants(node.id, edges);
    let staffMaxBottom = -Infinity;
    for (const id of staffIds) {
      const n = byId.get(id);
      if (!n) continue;
      const { height } = sizeForNode(n);
      staffMaxBottom = Math.max(staffMaxBottom, n.position.y + height);
    }
    if (!Number.isFinite(staffMaxBottom)) continue;

    const managerId = data.parentPersonId;
    const lineRoots: string[] = [];
    for (const edge of edges) {
      if (edge.source !== managerId) continue;
      if (edge.target === node.id) continue;
      // Direct child of manager that is not the staff label = line report root
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

    const desiredTop = staffMaxBottom + BAND_GAP;
    const delta = desiredTop - lineMinTop;
    if (delta <= 0) continue;

    for (const id of lineIds) {
      yShift.set(id, (yShift.get(id) ?? 0) + delta);
    }
  }

  if (yShift.size === 0) return nodes;

  return nodes.map((node) => {
    const dy = yShift.get(node.id);
    if (!dy) return node;
    return {
      ...node,
      position: {
        ...node.position,
        y: node.position.y + dy,
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
    const { width, height } = sizeForNode(node);
    graph.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagreLayout(graph);

  const layoutedNodes = nodes.map((node) => {
    const position = graph.node(node.id);
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
    nodes: stackLineBelowStaffBand(layoutedNodes, edges),
    edges,
  };
}

export const ORG_NODE_WIDTH = PERSON_NODE_WIDTH;
export const ORG_NODE_HEIGHT = PERSON_NODE_HEIGHT;
