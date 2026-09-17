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
const NESTED_OFFSET_X = 48;

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

function buildChildrenMap(edges: Edge[]): Map<string, string[]> {
  const childrenOf = new Map<string, string[]>();
  for (const edge of edges) {
    const list = childrenOf.get(edge.source) ?? [];
    list.push(edge.target);
    childrenOf.set(edge.source, list);
  }
  return childrenOf;
}

function subtreeBottom(
  byId: Map<string, Node>,
  rootId: string,
  edges: Edge[],
): number {
  const root = byId.get(rootId);
  if (!root) return 0;
  let bottom = root.position.y + sizeForNode(root).height;
  for (const desc of collectDescendants(rootId, edges)) {
    const n = byId.get(desc);
    if (!n) continue;
    bottom = Math.max(bottom, n.position.y + sizeForNode(n).height);
  }
  return bottom;
}

/**
 * Lay out children of a parent as a rightward comb:
 * parent → horizontal → vertical riser (optional hub) → stubs → cards.
 * Recurses so nested expansions (Cultura → people → reports) stay on the right.
 */
function layoutRightCombSubtree(
  byId: Map<string, Node>,
  parentId: string,
  edges: Edge[],
  childrenOf: Map<string, string[]>,
): void {
  const parent = byId.get(parentId);
  if (!parent) return;
  if (parent.type === "hub" || parent.type === "label") return;

  const rawChildren = childrenOf.get(parentId) ?? [];
  let hubId: string | null = null;
  const memberIds: string[] = [];

  for (const id of rawChildren) {
    const n = byId.get(id);
    if (!n) continue;
    if (n.type === "label") continue;
    if (n.type === "hub") {
      hubId = id;
      for (const mid of childrenOf.get(id) ?? []) {
        const m = byId.get(mid);
        if (m && (m.type === "person" || m.type === "department")) {
          memberIds.push(mid);
        }
      }
      continue;
    }
    if (n.type === "person" || n.type === "department") {
      memberIds.push(id);
    }
  }

  if (memberIds.length === 0 && !hubId) return;

  const parentSize = sizeForNode(parent);
  const hubX = parent.position.x + parentSize.width + NESTED_OFFSET_X;
  const hubY = parent.position.y + Math.min(20, parentSize.height / 3);

  byId.set(parentId, {
    ...parent,
    sourcePosition: Position.Right,
  });

  if (hubId) {
    byId.set(hubId, {
      ...byId.get(hubId)!,
      position: { x: hubX, y: hubY },
      targetPosition: Position.Left,
      sourcePosition: Position.Bottom,
    });
  }

  const memberX = hubX + STAFF_STUB;
  let cursorY = hubY + (hubId ? 24 : 0);

  for (const id of memberIds) {
    const n = byId.get(id)!;
    const { height } = sizeForNode(n);

    byId.set(id, {
      ...n,
      position: { x: memberX, y: cursorY },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });

    layoutRightCombSubtree(byId, id, edges, childrenOf);

    cursorY = subtreeBottom(byId, id, edges) + STAFF_GAP_Y;
    void height;
  }
}

/**
 * Staff comb (right side) for the Staff band, then nested rightward combs
 * for every expanded staff department / person so expansions never fold
 * back over the main director spine.
 */
function applyStaffCombLayout<N extends Node, E extends Edge>(
  nodes: N[],
  edges: E[],
): N[] {
  const byId = new Map(nodes.map((n) => [n.id, { ...n }]));
  const childrenOf = buildChildrenMap(edges);

  // Top-level Staff hubs (parent is a person manager).
  for (const node of nodes) {
    if (node.type !== "hub") continue;
    const hubData = node.data as {
      parentPersonId?: string;
      parentNodeId?: string;
    };
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

    // Manager sources line reports downward; staff leaves via hub.
    byId.set(managerId, {
      ...manager,
      sourcePosition: Position.Bottom,
    });

    let cursorY = hubY + 28;
    for (const id of memberIds) {
      const n = byId.get(id)!;
      const { height } = sizeForNode(n);
      const memberX = hubX + STAFF_STUB;

      byId.set(id, {
        ...n,
        position: { x: memberX, y: cursorY },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      });

      // Nested comb for expanded department / person content.
      layoutRightCombSubtree(byId, id, edges, childrenOf);

      cursorY = subtreeBottom(byId, id, edges) + STAFF_GAP_Y;
      void height;
    }
  }

  // Push line-report subtrees below the full staff comb (including nested).
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
      staffMaxBottom = Math.max(
        staffMaxBottom,
        n.position.y + sizeForNode(n).height,
      );
    }

    const lineRoots: string[] = [];
    for (const edge of edges) {
      if (edge.source !== managerId) continue;
      if (edge.target === node.id) continue;
      // Skip if target is already in the staff subtree
      if (staffIds.has(edge.target)) continue;
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

/**
 * Edges inside staff subtrees should not pull dagre into a tall TB layout
 * that later overlaps directors — staff positions are owned by the comb pass.
 */
function isStaffOwnedEdge(edge: Edge, nodesById: Map<string, Node>): boolean {
  if ((edge.data as { staff?: boolean } | undefined)?.staff) return true;
  const source = nodesById.get(edge.source);
  const target = nodesById.get(edge.target);
  if (source?.type === "hub" || target?.type === "hub") return true;
  if (source?.type === "department" || target?.type === "department") {
    return true;
  }
  return false;
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
  const nodesById = new Map(nodes.map((n) => [n.id, n]));

  // Collect every node that belongs to a staff comb (hub descendants + labels).
  const staffOwnedIds = new Set<string>();
  for (const node of nodes) {
    if (node.type !== "hub") continue;
    const data = node.data as { parentPersonId?: string };
    if (!data.parentPersonId) continue; // only top-level staff hubs
    for (const id of collectDescendants(node.id, edges)) {
      staffOwnedIds.add(id);
    }
    staffOwnedIds.add(node.id);
    staffOwnedIds.add(`staff-label-${data.parentPersonId}`);
  }

  const graph = new graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: options.nodesep ?? 40,
    ranksep: options.ranksep ?? 56,
    marginx: 24,
    marginy: 24,
  });

  for (const node of nodes) {
    if (node.type === "label") continue;
    // Nested staff content (dept hubs, expanded members) is placed by comb.
    if (staffOwnedIds.has(node.id) && node.type !== "hub") {
      // Keep top-level staff hubs + first wave is positioned in comb;
      // still register hubs so manager→hub edge exists for dagre rank of manager.
      if (node.type === "person" || node.type === "department") continue;
    }
    if (node.type === "hub") {
      const data = node.data as { parentPersonId?: string };
      // Only top-level staff hubs participate in dagre (anchor on manager).
      if (!data.parentPersonId) continue;
    }
    const { width, height } = sizeForNode(node);
    graph.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (source?.type === "label" || target?.type === "label") continue;
    if (isStaffOwnedEdge(edge, nodesById) && target?.type !== "hub") {
      // Keep manager → top-level staff hub so the hub ranks near the manager.
      const targetData = target?.data as { parentPersonId?: string } | undefined;
      if (!(target?.type === "hub" && targetData?.parentPersonId)) continue;
    }
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
    graph.setEdge(edge.source, edge.target);
  }

  // Also ensure manager→hub edges are present for staff hubs.
  for (const edge of edges) {
    const target = nodesById.get(edge.target);
    if (target?.type !== "hub") continue;
    const data = target.data as { parentPersonId?: string };
    if (!data.parentPersonId) continue;
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
    if (!graph.hasEdge(edge.source, edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
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
        position: node.position ?? { x: 0, y: 0 },
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
