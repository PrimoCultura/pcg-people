import type { Edge, Node } from "@xyflow/react";
import { getAreaManagerClinics } from "@/data/mockClinics";
import {
  getDepartmentOrganizationalPlacement,
  type Department,
} from "@/data/department";
import { mockDepartments } from "@/data/mockDepartments";
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

export type OrgMode = "organization" | "network";
export type OrgRootStatus = "ok" | "multiple" | "missing";

export type PersonOrgNodeData = {
  kind: "person";
  personId: string;
  firstName: string;
  lastName: string;
  role: string;
  photoUrl?: string | null;
  metaLabel: string;
  clinicCount?: number;
  hasChildren: boolean;
  isExpanded: boolean;
  canCollapse: boolean;
  isAreaManager: boolean;
};

/** Thin staff-band title — not interactive. */
export type OrgStaffLabelNodeData = {
  kind: "group";
  label: string;
  parentPersonId: string;
};

/** Clickable virtual department in the Staff band. */
export type OrgDepartmentNodeData = {
  kind: "department";
  label: string;
  departmentId: string;
  parentPersonId: string;
};

export type OrgPersonNode = Node<PersonOrgNodeData, "person">;
export type OrgStaffLabelNode = Node<OrgStaffLabelNodeData, "group">;
export type OrgDepartmentNode = Node<OrgDepartmentNodeData, "department">;
export type OrgChartNode =
  | OrgPersonNode
  | OrgStaffLabelNode
  | OrgDepartmentNode;

export type ClinicLike = {
  id: string;
  areaManagerId: string;
};

function buildChildMap(people: Person[]): Map<string, Person[]> {
  const map = new Map<string, Person[]>();
  for (const person of people) {
    if (!person.managerId) continue;
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

export function getOrganizationPeople(people: Person[] = mockPeople): Person[] {
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
    if (rootIds.has(person.id)) continue;
    if ((childMap.get(person.id) ?? []).length > 0) {
      collapsed.add(person.id);
    }
  }

  return collapsed;
}

export function getAllCollapsibleIds(
  mode: OrgMode,
  people: Person[] = mockPeople,
): Set<string> {
  const scoped = getPeopleForMode(mode, people);
  const childMap = buildChildMap(scoped);
  const { roots } = getDiagramRoots(mode, scoped, people);
  const rootIds = new Set(roots.map((r) => r.id));
  const ids = new Set<string>();
  for (const [id, children] of childMap) {
    if (children.length > 0 && !rootIds.has(id)) ids.add(id);
  }
  return ids;
}

function collectVisibleIds(
  roots: Person[],
  childMap: Map<string, Person[]>,
  collapsed: Set<string>,
): Set<string> {
  const rootIds = new Set(roots.map((r) => r.id));
  const visible = new Set<string>();

  const visit = (person: Person) => {
    if (visible.has(person.id)) return;
    visible.add(person.id);
    if (collapsed.has(person.id) && !rootIds.has(person.id)) return;
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

function staffLabelNodeId(parentId: string): string {
  return `group-staff-${parentId}`;
}

export function virtualDepartmentNodeId(departmentId: string): string {
  return `virtual-department-${departmentId}`;
}

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

/**
 * Staff department under this manager:
 * - organizationalPlacement === staff
 * - headId === manager
 * - NOT the manager's own primary department (e.g. CEO under Mirko)
 */
function staffDepartmentsForManager(
  manager: Person,
  departments: Department[],
): Department[] {
  return departments.filter((department) => {
    if (department.id === "network") return false;
    if (getDepartmentOrganizationalPlacement(department) !== "staff") {
      return false;
    }
    if (department.headId !== manager.id) return false;
    // Own primary function (CEO) must not appear under the person.
    if (manager.departmentId === department.id) return false;
    return true;
  });
}

/**
 * Builds React Flow nodes/edges.
 * Organization mode: Staff band between manager and line reports.
 * Network mode: plain managerId tree (unchanged behaviour).
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
  const rootIds = new Set(roots.map((r) => r.id));
  const effectiveCollapsed = new Set(
    [...collapsed].filter((id) => !rootIds.has(id)),
  );
  const visibleIds = collectVisibleIds(roots, childMap, effectiveCollapsed);
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
    const isRoot = rootIds.has(id);
    const canCollapse = hasChildren && !isRoot;

    nodes.push({
      id: person.id,
      type: "person",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      data: {
        kind: "person",
        personId: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        role: person.role,
        photoUrl: person.photoUrl,
        metaLabel: metaLabelFor(person, mode),
        clinicCount: isAreaManager(person)
          ? clinicCountFor(person.id)
          : undefined,
        hasChildren,
        canCollapse,
        isExpanded: isRoot
          ? true
          : hasChildren
            ? !effectiveCollapsed.has(person.id)
            : false,
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
    edgeIds.add(id);
    edges.push({
      id,
      source,
      target,
      type: "smoothstep",
      animated: false,
    });
  };

  const addStaffLabel = (parentId: string, label: string) => {
    const id = staffLabelNodeId(parentId);
    if (virtualIdsAdded.has(id)) return id;
    virtualIdsAdded.add(id);
    nodes.push({
      id,
      type: "group",
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      data: {
        kind: "group",
        label,
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
      type: "department",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      selectable: true,
      draggable: false,
      data: {
        kind: "department",
        label: department.name,
        departmentId: department.id,
        parentPersonId,
      },
    });
    return id;
  };

  // Network: plain tree, no Staff banding.
  if (mode === "network") {
    for (const managerId of visibleIds) {
      if (effectiveCollapsed.has(managerId) && !rootIds.has(managerId)) continue;
      if (!idSet.has(managerId)) continue;
      const children = (childMap.get(managerId) ?? []).filter(
        (c) =>
          visibleIds.has(c.id) && c.id !== managerId && personNodeIds.has(c.id),
      );
      for (const child of children) {
        pushEdge(managerId, child.id);
      }
    }

    const seenPerson = new Set<string>();
    const uniqueNodes = nodes.filter((node) => {
      if (node.type !== "person") return true;
      if (seenPerson.has(node.id)) return false;
      seenPerson.add(node.id);
      return true;
    });
    return { nodes: uniqueNodes, edges, status, orphans };
  }

  // Organization mode: Staff band between manager and line reports.
  for (const managerId of visibleIds) {
    if (effectiveCollapsed.has(managerId) && !rootIds.has(managerId)) continue;
    if (!idSet.has(managerId)) continue;

    const manager = byId.get(managerId);
    if (!manager) continue;

    const children = (childMap.get(managerId) ?? []).filter(
      (c) =>
        visibleIds.has(c.id) && c.id !== managerId && personNodeIds.has(c.id),
    );
    const { lineReports, staffReports } = splitReports(children);
    const staffDepts = staffDepartmentsForManager(manager, departments);
    const showStaff = staffReports.length > 0 || staffDepts.length > 0;

    if (!showStaff) {
      for (const child of lineReports) {
        pushEdge(managerId, child.id);
      }
      continue;
    }

    const staffLabelId = addStaffLabel(managerId, staffGroupLabel(manager));
    pushEdge(managerId, staffLabelId);

    const staffPlaced = new Set<string>();
    for (const dept of staffDepts) {
      const deptNodeId = addDepartmentNode(managerId, dept);
      pushEdge(staffLabelId, deptNodeId);
      for (const person of staffReports) {
        if (person.departmentId !== dept.id) continue;
        pushEdge(deptNodeId, person.id);
        staffPlaced.add(person.id);
      }
    }

    for (const person of staffReports) {
      if (staffPlaced.has(person.id)) continue;
      pushEdge(staffLabelId, person.id);
    }

    // Line reports hang from the manager; layout stacks them below the Staff band.
    for (const child of lineReports) {
      pushEdge(managerId, child.id);
    }
  }

  const seenPerson = new Set<string>();
  const uniqueNodes = nodes.filter((node) => {
    if (node.type !== "person") return true;
    if (seenPerson.has(node.id)) return false;
    seenPerson.add(node.id);
    return true;
  });

  return { nodes: uniqueNodes, edges, status, orphans };
}
