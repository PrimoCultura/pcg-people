import type { Edge, Node } from "@xyflow/react";
import {
  getDepartmentOrganizationalPlacement,
  type Department,
} from "@/data/department";
import { mockDepartments } from "@/data/mockDepartments";
import { mockPeople } from "@/data/mockPeople";
import {
  getReportingType,
  type Person,
} from "@/data/types";
import { getPersonDepartmentLabel } from "@/lib/personLabels";
import {
  staffHubNodeId,
  staffLabelNodeId,
  virtualDepartmentNodeId,
  type OrgChartNode,
  type OrgDepartmentNodeData,
  type OrgHubNodeData,
  type OrgLabelNodeData,
  type PersonOrgNodeData,
} from "@/lib/organizationTree";

export const VIRTUAL_CEO_DEPARTMENT_ID = "virtual-ceo";

export type DepartmentOverviewStatus = "ok" | "missing-ceo" | "missing-root";

function isNetworkDepartment(department: Department): boolean {
  const slug = (department.slug ?? department.id).toLowerCase();
  return slug === "network" || department.name.trim().toLowerCase() === "network";
}

function isCeoDepartment(department: Department): boolean {
  const slug = (department.slug ?? "").toLowerCase();
  if (slug === "ceo") return true;
  return /^ceo$/i.test(department.name.trim());
}

/** Resolve the CEO function used as root of the departments overview. */
export function resolveCeoDepartment(
  departments: Department[] = mockDepartments,
  people: Person[] = mockPeople,
): Department | null {
  const explicit = departments.find(isCeoDepartment);
  if (explicit) return explicit;

  const roots = people.filter((p) => p.isOrgRoot === true && !p.managerId);
  if (roots.length !== 1) return null;
  const root = roots[0];

  return {
    id: VIRTUAL_CEO_DEPARTMENT_ID,
    name: "CEO",
    slug: "ceo",
    shortDescription: "Vertice e direzione generale del gruppo.",
    description:
      "Funzione CEO: vertice aziendale, indirizzo strategico e coordinamento delle direzioni.",
    headId: root.id,
    contactFor: [],
    tags: ["ceo"],
    order: 0,
  };
}

export function getDepartmentById(
  departmentId: string,
  departments: Department[] = mockDepartments,
  people: Person[] = mockPeople,
): Department | null {
  const found = departments.find((d) => d.id === departmentId);
  if (found) return found;
  if (departmentId === VIRTUAL_CEO_DEPARTMENT_ID) {
    return resolveCeoDepartment(departments, people);
  }
  return null;
}

function departmentNodeId(departmentId: string): string {
  return virtualDepartmentNodeId(departmentId);
}

function personNodeData(person: Person): PersonOrgNodeData {
  return {
    kind: "person",
    personId: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    role: person.role,
    photoUrl: person.photoUrl,
    metaLabel: getPersonDepartmentLabel(person),
    hasChildren: false,
    isExpanded: false,
    canCollapse: false,
    isAreaManager: false,
  };
}

function departmentNodeData(
  department: Department,
  opts?: { canCollapse?: boolean; isExpanded?: boolean; hasChildren?: boolean },
): OrgDepartmentNodeData {
  return {
    kind: "department",
    label: department.name,
    departmentId: department.id,
    parentPersonId: department.headId ?? "",
    hasChildren: opts?.hasChildren ?? false,
    isExpanded: opts?.isExpanded ?? false,
    canCollapse: opts?.canCollapse ?? false,
  };
}

/**
 * Overview: CEO department at the root, staff functions/people on a comb,
 * line departments as main branches.
 */
export function buildDepartmentOverviewGraph(
  people: Person[] = mockPeople,
  departments: Department[] = mockDepartments,
): {
  nodes: OrgChartNode[];
  edges: Edge[];
  status: DepartmentOverviewStatus;
  ceo: Department | null;
} {
  const ceo = resolveCeoDepartment(departments, people);
  if (!ceo) {
    return { nodes: [], edges: [], status: "missing-ceo", ceo: null };
  }
  if (!ceo.headId) {
    return { nodes: [], edges: [], status: "missing-root", ceo };
  }

  const head = people.find((p) => p.id === ceo.headId);
  if (!head) {
    return { nodes: [], edges: [], status: "missing-root", ceo };
  }

  const ceoNodeId = departmentNodeId(ceo.id);
  const nodes: OrgChartNode[] = [
    {
      id: ceoNodeId,
      type: "department",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      data: departmentNodeData(ceo),
    },
  ];

  const edges: Edge[] = [];
  const edgeIds = new Set<string>();
  const pushEdge = (
    source: string,
    target: string,
    opts?: { staff?: boolean },
  ) => {
    const id = `e-${source}-${target}`;
    if (edgeIds.has(id)) return;
    edgeIds.add(id);
    edges.push({
      id,
      source,
      target,
      type: "smoothstep",
      animated: false,
      data: opts?.staff ? { staff: true } : undefined,
      style: opts?.staff
        ? { stroke: "var(--pcg-border-strong, #94a3b8)" }
        : undefined,
    });
  };

  const staffDepartments = departments
    .filter((d) => !isNetworkDepartment(d) && d.id !== ceo.id)
    .filter(
      (d) =>
        getDepartmentOrganizationalPlacement(d) === "staff" &&
        d.headId === head.id,
    )
    .sort((a, b) => a.name.localeCompare(b.name, "it"));

  const lineDepartments = departments
    .filter((d) => !isNetworkDepartment(d) && d.id !== ceo.id)
    .filter((d) => !staffDepartments.some((s) => s.id === d.id))
    .filter((d) => getDepartmentOrganizationalPlacement(d) === "line")
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name, "it"));

  const staffDeptIds = new Set(staffDepartments.map((d) => d.id));
  const staffPeople = people
    .filter(
      (p) =>
        p.managerId === head.id &&
        p.id !== head.id &&
        getReportingType(p) === "staff" &&
        !staffDeptIds.has(p.departmentId ?? ""),
    )
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );

  const showStaff = staffDepartments.length > 0 || staffPeople.length > 0;

  if (showStaff) {
    const hubId = staffHubNodeId(ceoNodeId);
    const labelId = staffLabelNodeId(ceoNodeId);
    nodes.push({
      id: hubId,
      type: "hub",
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      data: {
        kind: "hub",
        parentNodeId: ceoNodeId,
        parentPersonId: ceoNodeId,
      } satisfies OrgHubNodeData,
    });
    nodes.push({
      id: labelId,
      type: "label",
      position: { x: 0, y: 0 },
      selectable: false,
      draggable: false,
      data: {
        kind: "label",
        label: "Staff",
        parentPersonId: ceoNodeId,
      } satisfies OrgLabelNodeData,
    });
    pushEdge(ceoNodeId, hubId, { staff: true });

    for (const dept of staffDepartments) {
      const id = departmentNodeId(dept.id);
      nodes.push({
        id,
        type: "department",
        position: { x: 0, y: 0 },
        style: { cursor: "pointer", pointerEvents: "auto" },
        data: departmentNodeData(dept),
      });
      pushEdge(hubId, id, { staff: true });
    }

    for (const person of staffPeople) {
      nodes.push({
        id: person.id,
        type: "person",
        position: { x: 0, y: 0 },
        style: { cursor: "pointer", pointerEvents: "auto" },
        data: personNodeData(person),
      });
      pushEdge(hubId, person.id, { staff: true });
    }
  }

  for (const dept of lineDepartments) {
    const id = departmentNodeId(dept.id);
    nodes.push({
      id,
      type: "department",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      data: departmentNodeData(dept),
    });
    pushEdge(ceoNodeId, id);
  }

  return { nodes, edges, status: "ok", ceo };
}

function buildDeptChildMap(
  members: Person[],
  memberIds: Set<string>,
): Map<string, Person[]> {
  const map = new Map<string, Person[]>();
  for (const person of members) {
    if (!person.managerId) continue;
    if (person.managerId === person.id) continue;
    if (!memberIds.has(person.managerId)) continue;
    if (!memberIds.has(person.id)) continue;
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

/** People belonging to a department focus (head included even if primary dept differs). */
export function getDepartmentFocusMembers(
  department: Department,
  people: Person[] = mockPeople,
): Person[] {
  const byId = new Map(people.map((p) => [p.id, p]));
  const members = people.filter((p) => p.departmentId === department.id);
  const result = new Map(members.map((p) => [p.id, p]));
  if (department.headId) {
    const head = byId.get(department.headId);
    if (head) result.set(head.id, head);
  }
  return [...result.values()];
}

export function getDepartmentFocusDefaultCollapsed(
  department: Department,
  people: Person[] = mockPeople,
): Set<string> {
  const members = getDepartmentFocusMembers(department, people);
  const memberIds = new Set(members.map((m) => m.id));
  const childMap = buildDeptChildMap(members, memberIds);
  const headId = department.headId;
  const collapsed = new Set<string>();
  for (const person of members) {
    if (person.id === headId) continue;
    if ((childMap.get(person.id) ?? []).length > 0) {
      collapsed.add(person.id);
    }
  }
  return collapsed;
}

export function getDepartmentFocusCollapsibleIds(
  department: Department,
  people: Person[] = mockPeople,
): Set<string> {
  const members = getDepartmentFocusMembers(department, people);
  const memberIds = new Set(members.map((m) => m.id));
  const childMap = buildDeptChildMap(members, memberIds);
  const headId = department.headId;
  const ids = new Set<string>();
  for (const [id, children] of childMap) {
    if (children.length > 0 && id !== headId) ids.add(id);
  }
  return ids;
}

/**
 * Focus chart: department head on top, then only people of that department
 * linked via managerId (with orphans attached to the head for rendering).
 */
export function buildDepartmentFocusGraph(
  department: Department,
  collapsed: Set<string>,
  people: Person[] = mockPeople,
): { nodes: OrgChartNode[]; edges: Edge[]; head: Person | null } {
  const members = getDepartmentFocusMembers(department, people);
  const memberIds = new Set(members.map((m) => m.id));
  const byId = new Map(members.map((p) => [p.id, p]));
  const head = department.headId ? (byId.get(department.headId) ?? null) : null;

  if (!head) {
    return { nodes: [], edges: [], head: null };
  }

  const childMap = buildDeptChildMap(members, memberIds);
  // Attach members whose manager is outside the department to the head.
  for (const person of members) {
    if (person.id === head.id) continue;
    if (person.managerId && memberIds.has(person.managerId)) continue;
    const list = childMap.get(head.id) ?? [];
    if (!list.some((p) => p.id === person.id)) {
      list.push(person);
      childMap.set(head.id, list);
    }
  }
  for (const [, list] of childMap) {
    list.sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
  }

  const effectiveCollapsed = new Set(
    [...collapsed].filter((id) => id !== head.id),
  );

  const visible = new Set<string>();
  const visit = (person: Person) => {
    if (visible.has(person.id)) return;
    visible.add(person.id);
    if (effectiveCollapsed.has(person.id) && person.id !== head.id) return;
    for (const child of childMap.get(person.id) ?? []) {
      visit(child);
    }
  };
  visit(head);

  const nodes: OrgChartNode[] = [];
  for (const id of visible) {
    const person = byId.get(id);
    if (!person) continue;
    const children = (childMap.get(id) ?? []).filter((c) => c.id !== id);
    const hasChildren = children.length > 0;
    const isRoot = id === head.id;
    nodes.push({
      id: person.id,
      type: "person",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      data: {
        ...personNodeData(person),
        hasChildren,
        canCollapse: hasChildren && !isRoot,
        isExpanded: isRoot
          ? true
          : hasChildren
            ? !effectiveCollapsed.has(person.id)
            : false,
      },
    });
  }

  const edges: Edge[] = [];
  const edgeIds = new Set<string>();
  for (const managerId of visible) {
    if (effectiveCollapsed.has(managerId) && managerId !== head.id) continue;
    for (const child of childMap.get(managerId) ?? []) {
      if (!visible.has(child.id)) continue;
      const id = `e-${managerId}-${child.id}`;
      if (edgeIds.has(id)) continue;
      edgeIds.add(id);
      edges.push({
        id,
        source: managerId,
        target: child.id,
        type: "smoothstep",
        animated: false,
      });
    }
  }

  return { nodes, edges, head };
}

export type { OrgChartNode, Node };
