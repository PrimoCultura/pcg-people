import type { Edge, Node } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { graphlib, layout as dagreLayout } from "@dagrejs/dagre";

const PERSON_NODE_WIDTH = 220;
const PERSON_NODE_HEIGHT = 112;
const GROUP_NODE_WIDTH = 160;
const GROUP_NODE_HEIGHT = 36;
const DEPT_NODE_WIDTH = 140;
const DEPT_NODE_HEIGHT = 32;
const STAFF_LATERAL_GAP = 48;

export type LayoutOptions = {
  direction?: "TB" | "LR";
  nodesep?: number;
  ranksep?: number;
};

function sizeForNode(node: Node): { width: number; height: number } {
  if (node.type === "group") {
    const kind = (node.data as { kind?: string } | undefined)?.kind;
    if (kind === "department") {
      return { width: DEPT_NODE_WIDTH, height: DEPT_NODE_HEIGHT };
    }
    return { width: GROUP_NODE_WIDTH, height: GROUP_NODE_HEIGHT };
  }
  return { width: PERSON_NODE_WIDTH, height: PERSON_NODE_HEIGHT };
}

function collectDescendants(
  rootId: string,
  edges: Edge[],
): Set<string> {
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
    for (const child of children.get(id) ?? []) {
      stack.push(child);
    }
  }
  return out;
}

/**
 * Shift each Staff branch to the right of the manager's line branch
 * so Staff reads as a secondary, lateral column.
 */
function applyStaffLateralOffset<N extends Node, E extends Edge>(
  nodes: N[],
  edges: E[],
): N[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const shifted = new Map<string, number>();

  for (const node of nodes) {
    if (node.type !== "group") continue;
    const data = node.data as { kind?: string; parentPersonId?: string };
    if (data.kind !== "staff" || !data.parentPersonId) continue;

    const staffIds = collectDescendants(node.id, edges);
    const lineGroupId = `group-line-${data.parentPersonId}`;
    const lineIds = byId.has(lineGroupId)
      ? collectDescendants(lineGroupId, edges)
      : new Set<string>();

    let lineMaxRight = -Infinity;
    for (const id of lineIds) {
      const n = byId.get(id);
      if (!n) continue;
      const { width } = sizeForNode(n);
      lineMaxRight = Math.max(lineMaxRight, n.position.x + width);
    }

    let staffMinLeft = Infinity;
    for (const id of staffIds) {
      const n = byId.get(id);
      if (!n) continue;
      staffMinLeft = Math.min(staffMinLeft, n.position.x);
    }

    if (!Number.isFinite(lineMaxRight) || !Number.isFinite(staffMinLeft)) {
      // No line branch — nudge staff slightly right of the manager.
      const manager = byId.get(data.parentPersonId);
      if (!manager) continue;
      const managerRight = manager.position.x + sizeForNode(manager).width;
      const delta = managerRight + STAFF_LATERAL_GAP - staffMinLeft;
      if (delta > 0) {
        for (const id of staffIds) {
          shifted.set(id, (shifted.get(id) ?? 0) + delta);
        }
      }
      continue;
    }

    const desiredLeft = lineMaxRight + STAFF_LATERAL_GAP;
    const delta = desiredLeft - staffMinLeft;
    if (delta <= 0) continue;
    for (const id of staffIds) {
      shifted.set(id, (shifted.get(id) ?? 0) + delta);
    }
  }

  if (shifted.size === 0) return nodes;

  return nodes.map((node) => {
    const dx = shifted.get(node.id);
    if (!dx) return node;
    return {
      ...node,
      position: {
        ...node.position,
        x: node.position.x + dx,
      },
    };
  });
}

/**
 * Positions nodes with Dagre (top-to-bottom by default), then nudges
 * Staff branches laterally so they don't compete with the main line.
 */
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
    ranksep: options.ranksep ?? 64,
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

  const withStaffOffset = applyStaffLateralOffset(layoutedNodes, edges);

  return { nodes: withStaffOffset, edges };
}

export const ORG_NODE_WIDTH = PERSON_NODE_WIDTH;
export const ORG_NODE_HEIGHT = PERSON_NODE_HEIGHT;
