import type { Edge, Node } from "@xyflow/react";
import { getAreaManagerClinics } from "@/data/mockClinics";
import {
  getDepartmentOrganizationalPlacement,
  type Department,
} from "@/data/department";
import { mockDepartments } from "@/data/mockDepartments";
import { mockPeople } from "@/data/mockPeople";
import type { Team } from "@/data/team";
import {
  getPersonFullName,
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
  /** Person manager when this is a Staff band hub. */
  parentPersonId?: string;
  /** Graph node the comb hangs from (person id or virtual-department-*). */
  parentNodeId: string;
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

export type OrgTeamNodeData = {
  kind: "team";
  label: string;
  teamId: string;
  departmentId: string;
  /** Display-only head label (e.g. when head coincides with dept head). */
  headLabel?: string | null;
  memberCount: number;
  hasChildren: boolean;
  isExpanded: boolean;
  canCollapse: boolean;
};

export type OrgPersonNode = Node<PersonOrgNodeData, "person">;
export type OrgLabelNode = Node<OrgLabelNodeData, "label">;
export type OrgHubNode = Node<OrgHubNodeData, "hub">;
export type OrgDepartmentNode = Node<OrgDepartmentNodeData, "department">;
export type OrgTeamNode = Node<OrgTeamNodeData, "team">;
export type OrgChartNode =
  | OrgPersonNode
  | OrgLabelNode
  | OrgHubNode
  | OrgDepartmentNode
  | OrgTeamNode;

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

export function virtualTeamNodeId(teamId: string): string {
  return `virtual-team-${teamId}`;
}

export function staffHubNodeId(parentId: string): string {
  return `staff-hub-${parentId}`;
}

export function staffLabelNodeId(parentId: string): string {
  return `staff-label-${parentId}`;
}

export function departmentHubNodeId(departmentId: string): string {
  return `dept-hub-${departmentId}`;
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

function isNetworkDepartment(department: Department): boolean {
  const slug = (department.slug ?? department.id).toLowerCase();
  return slug === "network" || department.name.trim().toLowerCase() === "network";
}

/** CEO is the manager's primary function — never a Staff AD department card. */
function isCeoDepartment(department: Department): boolean {
  const slug = (department.slug ?? "").toLowerCase();
  if (slug === "ceo") return true;
  return /^ceo$/i.test(department.name.trim());
}

/**
 * Staff departments shown as visual containers under a manager's Staff comb.
 *
 * Uses department.headId + organizationalPlacement (and a secondary-dept
 * heuristic when placement is unset). Never invents managerId edges.
 * The CEO function is never rendered as a Staff card.
 * The head person is never listed as a member.
 */
function staffDepartmentsForManager(
  manager: Person,
  departments: Department[],
): Department[] {
  const result: Department[] = [];

  for (const department of departments) {
    if (isNetworkDepartment(department)) continue;
    if (isCeoDepartment(department)) continue;
    if (department.headId !== manager.id) continue;

    if (getDepartmentOrganizationalPlacement(department) === "staff") {
      result.push(department);
      continue;
    }

    // Secondary function headed by this manager while they belong to another
    // department (typical: AD in Ceo heading Cultura). Treat as staff
    // container even if organizationalPlacement was never saved.
    if (manager.departmentId && department.id !== manager.departmentId) {
      result.push(department);
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name, "it"));
}

/**
 * People belonging to a staff department container (head excluded).
 * Includes members without managerId — they stay inside the department
 * as "da collocare", never as artificial first-line of the head.
 */
function departmentInnerMembers(
  department: Department,
  headPersonId: string,
  people: Person[],
): Person[] {
  return people
    .filter(
      (p) =>
        p.departmentId === department.id &&
        p.id !== headPersonId &&
        p.id !== department.headId,
    )
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "it",
      ),
    );
}

function buildInnerChildMap(
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

/** Roots of the inner hierarchy: manager outside the set / missing. */
function innerHierarchyRoots(
  members: Person[],
  memberIds: Set<string>,
): Person[] {
  return members
    .filter(
      (p) => !p.managerId || !memberIds.has(p.managerId),
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
  teams: Team[] = [],
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
        for (const team of teamsForDepartment(dept.id, teams)) {
          if (members.some((m) => m.teamId === team.id)) {
            collapsed.add(virtualTeamNodeId(team.id));
          }
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
  teams: Team[] = [],
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
        const members = departmentInnerMembers(dept, person.id, scoped);
        if (members.length > 0) {
          ids.add(virtualDepartmentNodeId(dept.id));
        }
        for (const team of teamsForDepartment(dept.id, teams)) {
          if (members.some((m) => m.teamId === team.id)) {
            ids.add(virtualTeamNodeId(team.id));
          }
        }
      }
    }
  }

  return ids;
}

function teamsForDepartment(departmentId: string, teams: Team[]): Team[] {
  return [...teams]
    .filter((t) => t.departmentId === departmentId)
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) ||
        a.name.localeCompare(b.name, "it"),
    );
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
  teams: Team[] = [],
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
        const deptTeamIds = new Set(
          teamsForDepartment(dept.id, teams).map((t) => t.id),
        );
        for (const member of departmentInnerMembers(dept, person.id, people)) {
          if (
            member.teamId &&
            deptTeamIds.has(member.teamId) &&
            collapsed.has(virtualTeamNodeId(member.teamId))
          ) {
            continue;
          }
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
  teams: Team[] = [],
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
    teams,
  );
  const byId = new Map(scoped.map((p) => [p.id, p]));

  // Members of staff department containers are shown inside those cards,
  // not in the global "missing manager" list.
  const staffContainedIds = new Set<string>();
  if (mode === "organization") {
    for (const person of scoped) {
      for (const dept of staffDepartmentsForManager(person, departments)) {
        for (const member of departmentInnerMembers(dept, person.id, scoped)) {
          staffContainedIds.add(member.id);
        }
      }
    }
  }

  const orphans =
    mode === "organization"
      ? getOrgOrphans(people).filter((p) => !staffContainedIds.has(p.id))
      : [];

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
        data: {
          kind: "hub",
          parentPersonId: managerId,
          parentNodeId: managerId,
        },
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

      if (!isExpanded || !hasChildren) continue;

      const deptHubId = departmentHubNodeId(dept.id);
      if (!virtualIdsAdded.has(deptHubId)) {
        virtualIdsAdded.add(deptHubId);
        nodes.push({
          id: deptHubId,
          type: "hub",
          position: { x: 0, y: 0 },
          selectable: false,
          draggable: false,
          data: {
            kind: "hub",
            parentNodeId: deptNodeId,
          },
        });
      }
      pushEdge(deptNodeId, deptHubId, { staff: true });

      const deptTeams = teamsForDepartment(dept.id, teams);
      const innerIds = new Set(inner.map((m) => m.id));
      const assignedToTeam = new Set<string>();

      for (const team of deptTeams) {
        const teamMembers = inner.filter((m) => m.teamId === team.id);
        if (teamMembers.length === 0) continue;
        for (const m of teamMembers) assignedToTeam.add(m.id);

        const teamNodeId = virtualTeamNodeId(team.id);
        const teamCollapsed = effectiveCollapsed.has(teamNodeId);
        const headPerson = team.headId ? byId.get(team.headId) : null;
        const headLabel = headPerson
          ? getPersonFullName(headPerson)
          : null;

        if (!virtualIdsAdded.has(teamNodeId)) {
          virtualIdsAdded.add(teamNodeId);
          nodes.push({
            id: teamNodeId,
            type: "team",
            position: { x: 0, y: 0 },
            style: { cursor: "pointer", pointerEvents: "auto" },
            data: {
              kind: "team",
              label: team.name,
              teamId: team.id,
              departmentId: dept.id,
              headLabel,
              memberCount: teamMembers.length,
              hasChildren: true,
              isExpanded: !teamCollapsed,
              canCollapse: true,
            },
          });
        }
        pushEdge(deptHubId, teamNodeId, { staff: true });

        if (teamCollapsed) continue;

        const teamIds = new Set(teamMembers.map((m) => m.id));
        const teamChildMap = buildInnerChildMap(teamMembers, teamIds);
        const teamRoots = innerHierarchyRoots(teamMembers, teamIds);
        for (const root of teamRoots) {
          if (!personNodeIds.has(root.id)) continue;
          pushEdge(teamNodeId, root.id, { staff: true });
        }
        for (const [parentId, kids] of teamChildMap) {
          if (effectiveCollapsed.has(parentId)) continue;
          for (const child of kids) {
            if (!personNodeIds.has(child.id)) continue;
            pushEdge(parentId, child.id, { staff: true });
          }
        }
      }

      const unassigned = inner.filter((m) => !assignedToTeam.has(m.id));
      const unassignedIds = new Set(unassigned.map((m) => m.id));
      const unassignedChildMap = buildInnerChildMap(unassigned, unassignedIds);
      const unassignedRoots = innerHierarchyRoots(unassigned, unassignedIds);

      for (const root of unassignedRoots) {
        if (!personNodeIds.has(root.id)) continue;
        pushEdge(deptHubId, root.id, { staff: true });
      }
      for (const [parentId, kids] of unassignedChildMap) {
        if (effectiveCollapsed.has(parentId)) continue;
        for (const child of kids) {
          if (!personNodeIds.has(child.id)) continue;
          pushEdge(parentId, child.id, { staff: true });
        }
      }

      // No teams: full department hierarchy under the hub.
      if (deptTeams.length === 0) {
        const allChildMap = buildInnerChildMap(inner, innerIds);
        const allRoots = innerHierarchyRoots(inner, innerIds);
        for (const root of allRoots) {
          if (!personNodeIds.has(root.id)) continue;
          pushEdge(deptHubId, root.id, { staff: true });
        }
        for (const [parentId, kids] of allChildMap) {
          if (effectiveCollapsed.has(parentId)) continue;
          for (const child of kids) {
            if (!personNodeIds.has(child.id)) continue;
            pushEdge(parentId, child.id, { staff: true });
          }
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
