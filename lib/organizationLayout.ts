import type { Edge, Node } from "@xyflow/react";
import { Position } from "@xyflow/react";
import { graphlib, layout as dagreLayout } from "@dagrejs/dagre";

const PERSON_NODE_WIDTH = 220;
const PERSON_NODE_HEIGHT = 112;
const GROUP_NODE_WIDTH = 160;
const GROUP_NODE_HEIGHT = 36;

export type LayoutOptions = {
  direction?: "TB" | "LR";
  nodesep?: number;
  ranksep?: number;
};

function sizeForNode(node: Node): { width: number; height: number } {
  if (node.type === "group") {
    return { width: GROUP_NODE_WIDTH, height: GROUP_NODE_HEIGHT };
  }
  return { width: PERSON_NODE_WIDTH, height: PERSON_NODE_HEIGHT };
}

/**
 * Positions nodes with Dagre (top-to-bottom by default).
 * Source of truth for coordinates — never hardcode person positions.
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
    nodesep: options.nodesep ?? 36,
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

  return { nodes: layoutedNodes, edges };
}

export const ORG_NODE_WIDTH = PERSON_NODE_WIDTH;
export const ORG_NODE_HEIGHT = PERSON_NODE_HEIGHT;
