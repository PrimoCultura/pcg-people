import type { Edge, Node } from "@xyflow/react";
import { getAreaManagerClinics } from "@/data/mockClinics";
import { mockPeople } from "@/data/mockPeople";
import {
  getReportingType,
  isAreaManager,
  isDistrictManager,
  isNetworkHead,
  type Person,
} from "@/data/types";
import {
  getPersonDepartmentLabel,
  getPersonDistrictLabel,
} from "@/lib/personLabels";

/** "organization" = full hierarchy from org root; "network" = Network role subgraph */
export type OrgMode = "organization" | "network";

export type OrgRootStatus = "ok" | "multiple" | "missing";

export type PersonOrgNodeData = {
  personId: string;
  firstName: string;
  lastName: string;
  role: string;
  photoUrl?: string | null;
  metaLabel: string;
  clinicCount?: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isAreaManager: boolean;
};

/** Virtual label node — rendering only, never persisted. */
export type OrgGroupNodeData = {
  label: string;
  kind: "line" | "staff";
  parentPersonId: string;
};

export type OrgPersonNode = Node<PersonOrgNodeData, "person">;
export type OrgGroupNode = Node<OrgGroupNodeData, "group">;
export type OrgChartNode = OrgPersonNode | OrgGroupNode;

export type ClinicLike = {
  id: string;
  areaManagerId: string;
};

function buildChildMap(people: Person[]): Map<string, Person[]> {
  const map = new Map<string, Person[]>();
  for (const person of people) {
    if (!person.managerId) continue;
    const list = map.get(person.managerId) ?? [];
    list.push(person);
    map.set(person.managerId, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
  }
  return map;
}

function splitReports(children: Person[]): {
  lineReports: Person[];
  staffReports: Person[];
} {
  const lineReports: Person[] = [];
  const staffReports: Person[] = [];
  for (const child of children) {
    if (getReportingType(child) === "staff") staffReports.push(child);
    else lineReports.push(child);
  }
  return { lineReports, staffReports };
}

/** Valid org roots: explicit vertice without a manager. */
export function getValidOrgRoots(people: Person[]): Person[] {
  return people
    .filter((person) => person.isOrgRoot === true && !person.managerId)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}

/** Active people missing manager who are not marked as org root. */
export function getOrgOrphans(people: Person[]): Person[] {
  return people
    .filter((person) => !person.managerId && person.isOrgRoot !== true)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}

export function analyzeOrgStructure(people: Person[]): {
  status: OrgRootStatus;
  roots: Person[];
  orphans: Person[];
} {
  const roots = getValidOrgRoots(people);
  const orphans = getOrgOrphans(people);
  if (roots.length === 0) return { status: "missing", roots, orphans };
  if (roots.length > 1) return { status: "multiple", roots, orphans };
  return { status: "ok", roots, orphans };
}

/** @deprecated use analyzeOrgStructure — kept alias for clarity during rename */
export const analyzeHqOrgStructure = analyzeOrgStructure;

function findNetworkRoots(people: Person[], idSet: Set<string>): Person[] {
  return people
    .filter((person) => {
      if (isNetworkHead(person)) return true;
      if (!person.managerId) return false;
      return !idSet.has(person.managerId);
    })
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}

/**
 * Full organization: every person participates in the managerId graph.
 * No filter by type hq/network.
 */
export function getOrganizationPeople(
  people: Person[] = mockPeople,
): Person[] {
  return people;
}

/** Network zoom: Head / District Manager / Area Manager only. */
export function getNetworkPeople(people: Person[] = mockPeople): Person[] {
  return people.filter(
    (person) =>
      isNetworkHead(person) ||
      isDistrictManager(person) ||
      isAreaManager(person),
  );
}

export function getPeopleForMode(
  mode: OrgMode,
  people: Person[] = mockPeople,
): Person[] {
  return mode === "organization"
    ? getOrganizationPeople(people)
    : getNetworkPeople(people);
}

function getDiagramRoots(
  mode: OrgMode,
  scoped: Person[],
  allPeople: Person[],
): { roots: Person[]; status: OrgRootStatus } {
  if (mode === "organization") {
    const roots = getValidOrgRoots(allPeople);
    if (roots.length === 0) return { roots: [], status: "missing" };
    if (roots.length > 1) return { roots: [], status: "multiple" };
    return { roots, status: "ok" };
  }
  const idSet = new Set(scoped.map((p) => p.id));
  return { roots: findNetworkRoots(scoped, idSet), status: "ok" };
}

export function getChildMapForMode(
  mode: OrgMode,
  people: Person[] = mockPeople,
): Map<string, Person[]> {
  return buildChildMap(getPeopleForMode(mode, people));
}

export function getDefaultCollapsedIds(
  mode: OrgMode,
  people: Person[] = mockPeople,
): Set<string> {
  const scoped = getPeopleForMode(mode, people);
  const childMap = buildChildMap(scoped);
  const { roots } = getDiagramRoots(mode, scoped, people);
  const rootIds = new Set(roots.map((r) => r.id));
  const collapsed = new Set<string>();

  for (const person of scoped) {
    const children = childMap.get(person.id) ?? [];
    if (children.length > 0 && !rootIds.has(person.id)) {
      collapsed.add(person.id);
    }
  }

  return collapsed;
}

export function getAllCollapsibleIds(
  mode: OrgMode,
  people: Person[] = mockPeople,
): Set<string> {
  const childMap = getChildMapForMode(mode, people);
  const ids = new Set<string>();
  for (const [id, children] of childMap) {
    if (children.length > 0) ids.add(id);
  }
  return ids;
}

function collectVisibleIds(
  roots: Person[],
  childMap: Map<string, Person[]>,
  collapsed: Set<string>,
): Set<string> {
  const visible = new Set<string>();

  const visit = (person: Person) => {
    visible.add(person.id);
    if (collapsed.has(person.id)) return;
    for (const child of childMap.get(person.id) ?? []) {
      visit(child);
    }
  };

  for (const root of roots) {
    visit(root);
  }

  return visible;
}

function metaLabelFor(person: Person, mode: OrgMode): string {
  if (mode === "network") {
    return getPersonDistrictLabel(person) ?? getPersonDepartmentLabel(person);
  }
  return getPersonDepartmentLabel(person);
}

function groupNodeId(parentId: string, kind: "line" | "staff"): string {
  return `group-${kind}-${parentId}`;
}

/**
 * Builds React Flow nodes/edges from managerId.
 * When a manager has staff reports, inserts virtual group labels
 * (Direzioni / Staff) for layout only — never persisted.
 */
export function buildOrganizationGraph(
  mode: OrgMode,
  collapsed: Set<string>,
  people: Person[] = mockPeople,
  clinics: ClinicLike[] = [],
): {
  nodes: OrgChartNode[];
  edges: Edge[];
  status: OrgRootStatus;
  orphans: Person[];
} {
  const scoped = getPeopleForMode(mode, people);
  const idSet = new Set(scoped.map((p) => p.id));
  const childMap = buildChildMap(scoped);
  const { roots, status } = getDiagramRoots(mode, scoped, people);
  const orphans = mode === "organization" ? getOrgOrphans(people) : [];
  const visibleIds = collectVisibleIds(roots, childMap, collapsed);
  const byId = new Map(scoped.map((p) => [p.id, p]));

  const clinicCountFor = (personId: string) => {
    if (clinics.length > 0) {
      return clinics.filter((c) => c.areaManagerId === personId).length;
    }
    return getAreaManagerClinics(personId).length;
  };

  const nodes: OrgChartNode[] = [];
  for (const id of visibleIds) {
    const person = byId.get(id);
    if (!person) continue;
    const children = childMap.get(id) ?? [];
    const hasChildren = children.length > 0;
    const clinicCount = isAreaManager(person)
      ? clinicCountFor(person.id)
      : undefined;

    nodes.push({
      id: person.id,
      type: "person",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      data: {
        personId: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        role: person.role,
        photoUrl: person.photoUrl,
        metaLabel: metaLabelFor(person, mode),
        clinicCount,
        hasChildren,
        isExpanded: hasChildren ? !collapsed.has(person.id) : false,
        isAreaManager: isAreaManager(person),
      },
    });
  }

  const edges: Edge[] = [];
  const groupIdsAdded = new Set<string>();

  const addGroupNode = (
    parentId: string,
    kind: "line" | "staff",
    label: string,
  ) => {
    const id = groupNodeId(parentId, kind);
    if (groupIdsAdded.has(id)) return id;
    groupIdsAdded.add(id);
    nodes.push({
      id,
      type: "group",
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      data: {
        label,
        kind,
        parentPersonId: parentId,
      },
    });
    return id;
  };

  // Attach visible children under each visible, expanded manager.
  for (const managerId of visibleIds) {
    if (collapsed.has(managerId)) continue;
    if (!idSet.has(managerId)) continue;

    const children = (childMap.get(managerId) ?? []).filter((c) =>
      visibleIds.has(c.id),
    );
    if (children.length === 0) continue;

    const { lineReports, staffReports } = splitReports(children);

    if (staffReports.length === 0) {
      for (const child of lineReports) {
        edges.push({
          id: `e-${managerId}-${child.id}`,
          source: managerId,
          target: child.id,
          type: "smoothstep",
          animated: false,
        });
      }
      continue;
    }

    if (lineReports.length > 0) {
      const lineGroupId = addGroupNode(managerId, "line", "Direzioni");
      edges.push({
        id: `e-${managerId}-${lineGroupId}`,
        source: managerId,
        target: lineGroupId,
        type: "smoothstep",
        animated: false,
      });
      for (const child of lineReports) {
        edges.push({
          id: `e-${lineGroupId}-${child.id}`,
          source: lineGroupId,
          target: child.id,
          type: "smoothstep",
          animated: false,
        });
      }
    }

    const staffGroupId = addGroupNode(managerId, "staff", "Staff");
    edges.push({
      id: `e-${managerId}-${staffGroupId}`,
      source: managerId,
      target: staffGroupId,
      type: "smoothstep",
      animated: false,
    });
    for (const child of staffReports) {
      edges.push({
        id: `e-${staffGroupId}-${child.id}`,
        source: staffGroupId,
        target: child.id,
        type: "smoothstep",
        animated: false,
      });
    }
  }

  return { nodes, edges, status, orphans };
}
