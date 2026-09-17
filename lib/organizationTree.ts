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

/** Text-only Staff band title — not interactive. */
export type OrgLabelNodeData = {
  kind: "label";
  label: string;
  parentPersonId: string;
};

/** Invisible junction for staff comb edges. */
export type OrgHubNodeData = {
  kind: "hub";
  parentPersonId: string;
};

export type OrgDepartmentNodeData = {
  kind: "department";
  label: string;
  departmentId: string;
  parentPersonId: string;
  hasChildren: boolean;
  isExpanded: boolean;
  canCollapse: boolean;
};

export type OrgPersonNode = Node<PersonOrgNodeData, "person">;
export type OrgLabelNode = Node<OrgLabelNodeData, "label">;
export type OrgHubNode = Node<OrgHubNodeData, "hub">;
export type OrgDepartmentNode = Node<OrgDepartmentNodeData, "department">;
export type OrgChartNode =
  | OrgPersonNode
  | OrgLabelNode
  | OrgHubNode
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

export function virtualDepartmentNodeId(departmentId: string): string {
  return `virtual-department-${departmentId}`;
}

export function staffHubNodeId(parentId: string): string {
  return `staff-hub-${parentId}`;
}

export function staffLabelNodeId(parentId: string): string {
  return `staff-label-${parentId}`;
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
 * Staff departments headed by this manager — always shown as visual containers
 * under Staff, even when the department is also the manager's primary
 * departmentId (e.g. AD head of Cultura). The head person is never duplicated.
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
    return department.headId === manager.id;
  });
}

/** First-level people inside a staff department (head excluded). */
function departmentInnerMembers(
  department: Department,
  managerId: string,
  people: Person[],
): Person[] {
  return people
    .filter(
      (p) =>
        p.departmentId === department.id &&
        p.managerId === managerId &&
        p.id !== managerId,
    )
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}

function metaLabelFor(person: Person, mode: OrgMode): string {
  if (mode === "network") {
    return getPersonDistrictLabel(person) ?? getPersonDepartmentLabel(person);
  }
  return getPersonDepartmentLabel(person);
}

export function getDefaultCollapsedIds(
  mode: OrgMode,
  people: Person[] = mockPeople,
  departments: Department[] = mockDepartments,
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

  if (mode === "organization") {
    for (const root of roots) {
      for (const dept of staffDepartmentsForManager(root, departments)) {
        const members = departmentInnerMembers(dept, root.id, scoped);
        if (members.length > 0) {
          collapsed.add(virtualDepartmentNodeId(dept.id));
        }
      }
    }
  }

  return collapsed;
}

export function getAllCollapsibleIds(
  mode: OrgMode,
  people: Person[] = mockPeople,
  departments: Department[] = mockDepartments,
): Set<string> {
  const scoped = getPeopleForMode(mode, people);
  const childMap = buildChildMap(scoped);
  const { roots } = getDiagramRoots(mode, scoped, people);
  const rootIds = new Set(roots.map((r) => r.id));
  const ids = new Set<string>();

  for (const [id, children] of childMap) {
    if (children.length > 0 && !rootIds.has(id)) ids.add(id);
  }

  if (mode === "organization") {
    for (const person of scoped) {
      for (const dept of staffDepartmentsForManager(person, departments)) {
        if (departmentInnerMembers(dept, person.id, scoped).length > 0) {
          ids.add(virtualDepartmentNodeId(dept.id));
        }
      }
    }
  }

  return ids;
}

/**
 * Visible people: roots always expand first level; staff absorbed by a
 * collapsed staff-department stay hidden until the department is expanded.
 */
function collectVisibleIds(
  mode: OrgMode,
  roots: Person[],
  childMap: Map<string, Person[]>,
  collapsed: Set<string>,
  departments: Department[],
  people: Person[],
): Set<string> {
  const rootIds = new Set(roots.map((r) => r.id));
  const visible = new Set<string>();
  const byId = new Map(people.map((p) => [p.id, p]));

  const absorbingDeptId = (
    managerId: string,
    child: Person,
  ): string | null => {
    if (mode !== "organization") return null;
    const manager = byId.get(managerId);
    if (!manager) return null;
    // Anyone in a staff department headed by this manager is shown under
    // that department card (not as a direct line/staff leaf of the manager).
    const dept = staffDepartmentsForManager(manager, departments).find(
      (d) => d.id === child.departmentId,
    );
    return dept ? virtualDepartmentNodeId(dept.id) : null;
  };

  const visit = (person: Person) => {
    if (visible.has(person.id)) return;
    visible.add(person.id);
    if (collapsed.has(person.id) && !rootIds.has(person.id)) return;

    for (const child of childMap.get(person.id) ?? []) {
      const absorbedBy = absorbingDeptId(person.id, child);
      if (absorbedBy && collapsed.has(absorbedBy)) {
        continue;
      }
      visit(child);
    }
  };

  for (const root of roots) {
    visit(root);
  }

  // When a staff department is expanded, ensure its inner members (and their
  // descendants) are visible even if the walk skipped them earlier.
  if (mode === "organization") {
    for (const person of people) {
      for (const dept of staffDepartmentsForManager(person, departments)) {
        const deptNodeId = virtualDepartmentNodeId(dept.id);
        if (collapsed.has(deptNodeId)) continue;
        if (!visible.has(person.id)) continue;
        for (const member of departmentInnerMembers(dept, person.id, people)) {
          visit(member);
        }
      }
    }
  }

  return visible;
}

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
  const visibleIds = collectVisibleIds(
    mode,
    roots,
    childMap,
    effectiveCollapsed,
    departments,
    scoped,
  );
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

  // Network: plain tree.
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
    return { nodes, edges, status, orphans };
  }

  // Organization mode.
  for (const managerId of visibleIds) {
    if (effectiveCollapsed.has(managerId) && !rootIds.has(managerId)) continue;
    if (!idSet.has(managerId)) continue;

    const manager = byId.get(managerId);
    if (!manager) continue;

    const children = (childMap.get(managerId) ?? []).filter(
      (c) => c.id !== managerId,
    );
    const { lineReports, staffReports } = splitReports(children);
    const staffDepts = staffDepartmentsForManager(manager, departments);
    const staffDeptIds = new Set(staffDepts.map((d) => d.id));
    const visibleLine = lineReports.filter(
      (c) =>
        visibleIds.has(c.id) &&
        personNodeIds.has(c.id) &&
        !staffDeptIds.has(c.departmentId ?? ""),
    );
    const looseStaff = staffReports.filter((p) => {
      if (!visibleIds.has(p.id) || !personNodeIds.has(p.id)) return false;
      return !staffDeptIds.has(p.departmentId ?? "");
    });

    const showStaff = looseStaff.length > 0 || staffDepts.length > 0;

    if (!showStaff) {
      for (const child of visibleLine) {
        pushEdge(managerId, child.id);
      }
      continue;
    }

    const hubId = staffHubNodeId(managerId);
    const labelId = staffLabelNodeId(managerId);

    if (!virtualIdsAdded.has(hubId)) {
      virtualIdsAdded.add(hubId);
      nodes.push({
        id: hubId,
        type: "hub",
        position: { x: 0, y: 0 },
        selectable: false,
        draggable: false,
        data: { kind: "hub", parentPersonId: managerId },
      });
    }

    if (!virtualIdsAdded.has(labelId)) {
      virtualIdsAdded.add(labelId);
      nodes.push({
        id: labelId,
        type: "label",
        position: { x: 0, y: 0 },
        selectable: false,
        draggable: false,
        data: {
          kind: "label",
          label: staffGroupLabel(manager),
          parentPersonId: managerId,
        },
      });
    }

    pushEdge(managerId, hubId, { staff: true });

    for (const dept of staffDepts) {
      const deptNodeId = virtualDepartmentNodeId(dept.id);
      const inner = departmentInnerMembers(dept, managerId, scoped);
      const hasChildren = inner.length > 0;
      const isExpanded = hasChildren
        ? !effectiveCollapsed.has(deptNodeId)
        : false;

      if (!virtualIdsAdded.has(deptNodeId)) {
        virtualIdsAdded.add(deptNodeId);
        nodes.push({
          id: deptNodeId,
          type: "department",
          position: { x: 0, y: 0 },
          style: { cursor: "pointer", pointerEvents: "auto" },
          selectable: true,
          draggable: false,
          data: {
            kind: "department",
            label: dept.name,
            departmentId: dept.id,
            parentPersonId: managerId,
            hasChildren,
            isExpanded,
            canCollapse: hasChildren,
          },
        });
      }

      pushEdge(hubId, deptNodeId, { staff: true });

      if (isExpanded) {
        for (const member of inner) {
          if (!personNodeIds.has(member.id)) continue;
          pushEdge(deptNodeId, member.id);
        }
      }
    }

    for (const person of looseStaff) {
      pushEdge(hubId, person.id, { staff: true });
    }

    for (const child of visibleLine) {
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
