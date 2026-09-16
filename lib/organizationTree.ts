import type { Edge, Node } from "@xyflow/react";
import { getAreaManagerClinics } from "@/data/mockClinics";
import { mockDepartments } from "@/data/mockDepartments";
import { mockPeople } from "@/data/mockPeople";
import type { Department } from "@/data/department";
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

/** Virtual label / department node — rendering only, never persisted. */
export type OrgGroupNodeData = {
  label: string;
  kind: "line" | "staff" | "department";
  parentPersonId: string;
  departmentId?: string;
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
    // Never treat a person as their own direct report.
    if (person.managerId === person.id) continue;
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

export function getOrganizationPeople(
  people: Person[] = mockPeople,
): Person[] {
  return people;
}

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
    if (visible.has(person.id)) return; // cycle / duplicate guard
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

export function virtualDepartmentNodeId(departmentId: string): string {
  return `virtual-department-${departmentId}`;
}

/** Staff label from manager role — never from person name. */
export function staffGroupLabel(manager: Person): string {
  const role = manager.role.trim().toLowerCase();
  if (
    role.includes("amministratore delegato") ||
    role.includes("chief executive") ||
    /(^|[^a-z])ad([^a-z]|$)/.test(role) ||
    /(^|[^a-z])ceo([^a-z]|$)/.test(role)
  ) {
    return "Staff AD";
  }
  return "Staff";
}

function shouldShowVirtualDepartment(
  manager: Person,
  department: Department,
  staffInDept: Person[],
  lineReports: Person[],
): boolean {
  if (department.headId !== manager.id) return false;
  if (department.id === "network") return false;
  if (staffInDept.length > 0) return true;
  // Empty staff function: only for org-root managers (e.g. AD heading Cultura)
  // so normal directors don't get an empty Staff column.
  if (!manager.isOrgRoot) return false;
  const lineInDept = lineReports.some((p) => p.departmentId === department.id);
  return !lineInDept;
}

/**
 * Builds React Flow nodes/edges from managerId.
 * Virtual group/department labels are layout-only — never persisted.
 * Each person id appears at most once as a person node.
 */
export function buildOrganizationGraph(
  mode: OrgMode,
  collapsed: Set<string>,
  people: Person[] = mockPeople,
  clinics: ClinicLike[] = [],
  departments: Department[] = mockDepartments,
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
  const personNodeIds = new Set<string>();

  for (const id of visibleIds) {
    if (personNodeIds.has(id)) continue;
    const person = byId.get(id);
    if (!person) continue;
    personNodeIds.add(id);

    const children = (childMap.get(id) ?? []).filter((c) => c.id !== id);
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
  const virtualIdsAdded = new Set<string>();
  const edgeIds = new Set<string>();

  const pushEdge = (source: string, target: string) => {
    const id = `e-${source}-${target}`;
    if (edgeIds.has(id)) return;
    // Never point a person edge at a duplicate person target twice from different paths
    // for the same logical attach — edge id already unique per pair.
    edgeIds.add(id);
    edges.push({
      id,
      source,
      target,
      type: "smoothstep",
      animated: false,
    });
  };

  const addGroupNode = (
    parentId: string,
    kind: "line" | "staff",
    label: string,
  ) => {
    const id = groupNodeId(parentId, kind);
    if (virtualIdsAdded.has(id)) return id;
    virtualIdsAdded.add(id);
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

  const addDepartmentNode = (
    parentPersonId: string,
    department: Department,
  ) => {
    const id = virtualDepartmentNodeId(department.id);
    if (virtualIdsAdded.has(id)) return id;
    virtualIdsAdded.add(id);
    nodes.push({
      id,
      type: "group",
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      data: {
        label: department.name,
        kind: "department",
        parentPersonId,
        departmentId: department.id,
      },
    });
    return id;
  };

  for (const managerId of visibleIds) {
    if (collapsed.has(managerId)) continue;
    if (!idSet.has(managerId)) continue;

    const manager = byId.get(managerId);
    if (!manager) continue;

    const children = (childMap.get(managerId) ?? []).filter(
      (c) => visibleIds.has(c.id) && c.id !== managerId && personNodeIds.has(c.id),
    );

    const { lineReports, staffReports } = splitReports(children);

    const headedDepts = departments.filter((d) =>
      shouldShowVirtualDepartment(
        manager,
        d,
        staffReports.filter((p) => p.departmentId === d.id),
        lineReports,
      ),
    );

    const showStaffBlock =
      staffReports.length > 0 || headedDepts.length > 0;

    // Line branch — no virtual group when there is no staff side.
    if (!showStaffBlock) {
      for (const child of lineReports) {
        pushEdge(managerId, child.id);
      }
      continue;
    }

    if (lineReports.length > 0) {
      const lineGroupId = addGroupNode(
        managerId,
        "line",
        "Linea gerarchica",
      );
      pushEdge(managerId, lineGroupId);
      for (const child of lineReports) {
        pushEdge(lineGroupId, child.id);
      }
    }

    const staffGroupId = addGroupNode(
      managerId,
      "staff",
      staffGroupLabel(manager),
    );
    pushEdge(managerId, staffGroupId);

    const staffPlaced = new Set<string>();

    for (const dept of headedDepts) {
      const deptNodeId = addDepartmentNode(managerId, dept);
      pushEdge(staffGroupId, deptNodeId);
      for (const person of staffReports) {
        if (person.departmentId !== dept.id) continue;
        if (person.id === managerId) continue;
        pushEdge(deptNodeId, person.id);
        staffPlaced.add(person.id);
      }
    }

    for (const person of staffReports) {
      if (staffPlaced.has(person.id)) continue;
      if (person.id === managerId) continue;
      pushEdge(staffGroupId, person.id);
    }
  }

  // Final uniqueness assertion for person nodes
  const seenPerson = new Set<string>();
  const uniqueNodes = nodes.filter((node) => {
    if (node.type !== "person") return true;
    if (seenPerson.has(node.id)) return false;
    seenPerson.add(node.id);
    return true;
  });

  return { nodes: uniqueNodes, edges, status, orphans };
}
