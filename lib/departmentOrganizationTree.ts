import type { Edge, Node } from "@xyflow/react";
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
  type Person,
} from "@/data/types";
import { getPersonDepartmentLabel } from "@/lib/personLabels";
import {
  buildChildTeamsByParent,
  buildTeamParentMap,
  nestedTeamsUnderPerson,
  topLevelTeams,
} from "@/lib/teamHierarchy";
import {
  virtualDepartmentNodeId,
  virtualTeamNodeId,
  type OrgChartNode,
  type OrgDepartmentNodeData,
  type OrgTeamNodeData,
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

function teamNodeData(
  team: Team,
  opts: {
    headLabel?: string | null;
    memberCount: number;
    canCollapse: boolean;
    isExpanded: boolean;
    hasChildren: boolean;
  },
): OrgTeamNodeData {
  return {
    kind: "team",
    label: team.name,
    teamId: team.id,
    departmentId: team.departmentId,
    headLabel: opts.headLabel,
    memberCount: opts.memberCount,
    hasChildren: opts.hasChildren,
    isExpanded: opts.isExpanded,
    canCollapse: opts.canCollapse,
  };
}

/**
 * Overview: CEO department at the root, then HQ department cards only.
 * No person cards here — people appear inside each department focus.
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

  const hqDepartments = departments
    .filter((d) => !isNetworkDepartment(d) && d.id !== ceo.id)
    .sort(
      (a, b) =>
        (a.order ?? 999) - (b.order ?? 999) ||
        a.name.localeCompare(b.name, "it"),
    );

  for (const dept of hqDepartments) {
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

function sortPeople(list: Person[]) {
  return [...list].sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(
      `${b.lastName} ${b.firstName}`,
      "it",
    ),
  );
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

/** People belonging to a department focus (head included even if primary dept differs). */
export function getDepartmentFocusMembers(
  department: Department,
  people: Person[] = mockPeople,
  allDepartments: Department[] = mockDepartments,
): Person[] {
  const byId = new Map(people.map((p) => [p.id, p]));
  const members = people.filter((p) => p.departmentId === department.id);
  const result = new Map(members.map((p) => [p.id, p]));
  if (department.headId) {
    const head = byId.get(department.headId);
    if (head) result.set(head.id, head);
  }

  if (isCeoDepartment(department) && department.headId) {
    const staffDeptIds = new Set(
      allDepartments
        .filter(
          (d) =>
            d.id !== department.id &&
            !isNetworkDepartment(d) &&
            getDepartmentOrganizationalPlacement(d) === "staff" &&
            d.headId === department.headId,
        )
        .map((d) => d.id),
    );
    for (const person of people) {
      if (person.id === department.headId) continue;
      if (person.managerId !== department.headId) continue;
      if (getReportingType(person) !== "staff") continue;
      if (staffDeptIds.has(person.departmentId ?? "")) continue;
      result.set(person.id, person);
    }
  }

  return [...result.values()];
}

export function getDepartmentFocusDefaultCollapsed(
  department: Department,
  people: Person[] = mockPeople,
  allDepartments: Department[] = mockDepartments,
  teams: Team[] = [],
): Set<string> {
  const deptTeams = teamsForDepartment(department.id, teams);
  const collapsed = new Set<string>();

  if (deptTeams.length > 0) {
    const members = getDepartmentFocusMembers(
      department,
      people,
      allDepartments,
    );
    const allPeopleById = new Map(people.map((p) => [p.id, p]));
    const parentMap = buildTeamParentMap(deptTeams, allPeopleById);
    const childTeamsByParent = buildChildTeamsByParent(deptTeams, parentMap);

    for (const team of deptTeams) {
      collapsed.add(virtualTeamNodeId(team.id));
    }

    // Persons who head a nested team start collapsed so "+" reveals the team.
    for (const [, childTeams] of childTeamsByParent) {
      for (const child of childTeams) {
        if (child.headId && child.headId !== department.headId) {
          collapsed.add(child.headId);
        }
      }
    }

    for (const team of topLevelTeams(deptTeams, parentMap)) {
      const teamMembers = members.filter((m) => m.teamId === team.id);
      const visibleSet = new Set(teamMembers.map((m) => m.id));
      if (team.headId && team.headId !== department.headId) {
        visibleSet.add(team.headId);
      }
      const childMap = buildDeptChildMap(
        members.filter((m) => visibleSet.has(m.id)),
        visibleSet,
      );
      for (const [id, children] of childMap) {
        if (
          children.length > 0 &&
          id !== team.headId &&
          id !== department.headId
        ) {
          collapsed.add(id);
        }
      }
    }

    return collapsed;
  }

  const members = getDepartmentFocusMembers(department, people, allDepartments);
  const memberIds = new Set(members.map((m) => m.id));
  const childMap = buildDeptChildMap(members, memberIds);
  const headId = department.headId;
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
  allDepartments: Department[] = mockDepartments,
  teams: Team[] = [],
): Set<string> {
  const deptTeams = teamsForDepartment(department.id, teams);
  const ids = new Set<string>();

  if (deptTeams.length > 0) {
    const members = getDepartmentFocusMembers(
      department,
      people,
      allDepartments,
    );
    const allPeopleById = new Map(people.map((p) => [p.id, p]));
    const parentMap = buildTeamParentMap(deptTeams, allPeopleById);
    const childTeamsByParent = buildChildTeamsByParent(deptTeams, parentMap);

    for (const team of deptTeams) {
      const teamMembers = members.filter((m) => m.teamId === team.id);
      const showHeadAsPerson =
        Boolean(team.headId) && team.headId !== department.headId;
      const nestedChildren = childTeamsByParent.get(team.id) ?? [];
      if (
        teamMembers.length > 0 ||
        showHeadAsPerson ||
        nestedChildren.length > 0
      ) {
        ids.add(virtualTeamNodeId(team.id));
      }

      for (const nested of nestedChildren) {
        if (nested.headId && nested.headId !== department.headId) {
          ids.add(nested.headId);
        }
      }

      const visibleSet = new Set(teamMembers.map((m) => m.id));
      if (showHeadAsPerson && team.headId) visibleSet.add(team.headId);
      const childMap = buildDeptChildMap(
        members.filter((m) => visibleSet.has(m.id)),
        visibleSet,
      );
      for (const [id, children] of childMap) {
        if (children.length > 0 && id !== team.headId) ids.add(id);
      }
    }
    const unassigned = members.filter(
      (m) => !m.teamId && m.id !== department.headId,
    );
    const unassignedIds = new Set([
      ...(department.headId ? [department.headId] : []),
      ...unassigned.map((m) => m.id),
    ]);
    const childMap = buildDeptChildMap(
      members.filter((m) => unassignedIds.has(m.id)),
      unassignedIds,
    );
    for (const [id, children] of childMap) {
      if (children.length > 0 && id !== department.headId) ids.add(id);
    }
    return ids;
  }

  const members = getDepartmentFocusMembers(department, people, allDepartments);
  const memberIds = new Set(members.map((m) => m.id));
  const childMap = buildDeptChildMap(members, memberIds);
  const headId = department.headId;
  for (const [id, children] of childMap) {
    if (children.length > 0 && id !== headId) ids.add(id);
  }
  return ids;
}

/**
 * Focus chart: department head on top.
 * When teams exist: top-level team cards under the head; nested teams hang
 * under their head person (explicit parentTeamId or inferred from head.teamId).
 * People without teamId stay under the head. managerId is never invented.
 * When no teams: legacy flat managerId tree (backward compatible).
 */
export function buildDepartmentFocusGraph(
  department: Department,
  collapsed: Set<string>,
  people: Person[] = mockPeople,
  allDepartments: Department[] = mockDepartments,
  teams: Team[] = [],
): { nodes: OrgChartNode[]; edges: Edge[]; head: Person | null } {
  const members = getDepartmentFocusMembers(department, people, allDepartments);
  const byId = new Map(members.map((p) => [p.id, p]));
  const allPeopleById = new Map(people.map((p) => [p.id, p]));
  const head = department.headId
    ? (byId.get(department.headId) ??
      allPeopleById.get(department.headId) ??
      null)
    : null;

  if (!head) {
    return { nodes: [], edges: [], head: null };
  }

  const deptTeams = teamsForDepartment(department.id, teams);
  if (deptTeams.length === 0) {
    return buildLegacyDepartmentFocusGraph(head, members, collapsed);
  }

  return buildTeamAwareDepartmentFocusGraph(
    department,
    head,
    members,
    deptTeams,
    collapsed,
    allPeopleById,
  );
}

function buildLegacyDepartmentFocusGraph(
  head: Person,
  members: Person[],
  collapsed: Set<string>,
): { nodes: OrgChartNode[]; edges: Edge[]; head: Person } {
  const memberIds = new Set(members.map((m) => m.id));
  const byId = new Map(members.map((p) => [p.id, p]));
  const childMap = buildDeptChildMap(members, memberIds);

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

function buildTeamAwareDepartmentFocusGraph(
  department: Department,
  head: Person,
  members: Person[],
  deptTeams: Team[],
  collapsed: Set<string>,
  allPeopleById: Map<string, Person>,
): { nodes: OrgChartNode[]; edges: Edge[]; head: Person } {
  const nodes: OrgChartNode[] = [];
  const edges: Edge[] = [];
  const edgeIds = new Set<string>();
  const personNodesAdded = new Set<string>();
  const teamNodesAdded = new Set<string>();

  const parentMap = buildTeamParentMap(deptTeams, allPeopleById);
  const childTeamsByParent = buildChildTeamsByParent(deptTeams, parentMap);
  const rootTeams = topLevelTeams(deptTeams, parentMap);

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

  const pushPersonNode = (
    person: Person,
    opts: { hasChildren: boolean; canCollapse: boolean; isExpanded: boolean },
  ) => {
    if (personNodesAdded.has(person.id)) {
      const existing = nodes.find((n) => n.id === person.id);
      if (
        existing &&
        existing.type === "person" &&
        opts.hasChildren &&
        !existing.data.hasChildren
      ) {
        existing.data = {
          ...existing.data,
          hasChildren: true,
          canCollapse: opts.canCollapse,
          isExpanded: opts.isExpanded,
        };
      }
      return;
    }
    personNodesAdded.add(person.id);
    nodes.push({
      id: person.id,
      type: "person",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      data: {
        ...personNodeData(person),
        ...opts,
      },
    });
  };

  pushPersonNode(head, {
    hasChildren: true,
    canCollapse: false,
    isExpanded: true,
  });

  const renderTeam = (
    team: Team,
    attachToNodeId: string,
    attachUnderPersonId: string | null,
  ) => {
    if (teamNodesAdded.has(team.id)) return;
    teamNodesAdded.add(team.id);

    const teamNodeId = virtualTeamNodeId(team.id);
    const teamMembers = members.filter((m) => m.teamId === team.id);
    const headPerson = team.headId
      ? (allPeopleById.get(team.headId) ?? null)
      : null;
    const headIsDeptHead = Boolean(team.headId && team.headId === head.id);
    const showHeadAsPerson = Boolean(
      headPerson && !headIsDeptHead && headPerson.id !== attachUnderPersonId,
    );

    const displayMembers = teamMembers.filter((m) => m.id !== head.id);
    const subtreePeople = new Map(
      displayMembers.map((p) => [p.id, p] as const),
    );
    if (showHeadAsPerson && headPerson && !subtreePeople.has(headPerson.id)) {
      subtreePeople.set(headPerson.id, headPerson);
    }

    const nestedDirect = childTeamsByParent.get(team.id) ?? [];
    let personRoots = [...subtreePeople.values()].filter(
      (person) =>
        !(person.managerId && subtreePeople.has(person.managerId)),
    );

    const subtreeIds = new Set(subtreePeople.keys());
    const childMap = buildDeptChildMap(
      [...subtreePeople.values()],
      subtreeIds,
    );

    if (showHeadAsPerson && headPerson && subtreeIds.has(headPerson.id)) {
      const withoutHead = personRoots.filter((p) => p.id !== headPerson.id);
      for (const orphan of withoutHead) {
        const list = childMap.get(headPerson.id) ?? [];
        if (!list.some((p) => p.id === orphan.id)) {
          list.push(orphan);
          childMap.set(headPerson.id, list);
        }
      }
      for (const [key, list] of childMap) {
        childMap.set(key, sortPeople(list));
      }
      personRoots = [headPerson];
    } else {
      personRoots = sortPeople(personRoots);
    }

    for (const nested of nestedDirect) {
      if (!nested.headId || nested.headId === head.id) continue;
      if (subtreePeople.has(nested.headId)) continue;
      const nestedHead = allPeopleById.get(nested.headId);
      if (!nestedHead) continue;
      subtreePeople.set(nestedHead.id, nestedHead);
      subtreeIds.add(nestedHead.id);
      personRoots = sortPeople([...personRoots, nestedHead]);
    }

    const hasMemberSubtree =
      subtreePeople.size > 0 || nestedDirect.length > 0;
    const isExpanded = hasMemberSubtree ? !collapsed.has(teamNodeId) : false;
    const headLabel = headPerson ? getPersonFullName(headPerson) : null;

    nodes.push({
      id: teamNodeId,
      type: "team",
      position: { x: 0, y: 0 },
      style: { cursor: "pointer", pointerEvents: "auto" },
      data: teamNodeData(team, {
        headLabel,
        memberCount: teamMembers.length,
        hasChildren: hasMemberSubtree,
        isExpanded,
        canCollapse: hasMemberSubtree,
      }),
    });
    pushEdge(attachToNodeId, teamNodeId);

    if (!isExpanded || !hasMemberSubtree) return;

    const visible = new Set<string>();
    const visit = (person: Person) => {
      if (visible.has(person.id)) return;
      visible.add(person.id);
      if (collapsed.has(person.id)) return;
      for (const child of childMap.get(person.id) ?? []) {
        visit(child);
      }
    };
    for (const root of personRoots) visit(root);

    for (const nested of nestedDirect) {
      if (!nested.headId) continue;
      const nestedHead = subtreePeople.get(nested.headId);
      if (nestedHead) visible.add(nestedHead.id);
    }

    for (const id of visible) {
      const person = subtreePeople.get(id);
      if (!person) continue;
      const children = (childMap.get(id) ?? []).filter((c) => c.id !== id);
      const nestedUnder = nestedTeamsUnderPerson(
        person.id,
        team.id,
        childTeamsByParent,
      );
      const hasPersonChildren = children.length > 0 || nestedUnder.length > 0;
      const personExpanded = hasPersonChildren
        ? !collapsed.has(person.id)
        : false;
      pushPersonNode(person, {
        hasChildren: hasPersonChildren,
        canCollapse: hasPersonChildren,
        isExpanded: personExpanded,
      });
    }

    for (const root of personRoots) {
      if (!visible.has(root.id)) continue;
      pushEdge(teamNodeId, root.id);
    }
    for (const managerId of visible) {
      if (collapsed.has(managerId)) continue;
      for (const child of childMap.get(managerId) ?? []) {
        if (!visible.has(child.id)) continue;
        pushEdge(managerId, child.id);
      }
    }

    for (const id of visible) {
      if (collapsed.has(id)) continue;
      const nestedUnder = nestedTeamsUnderPerson(
        id,
        team.id,
        childTeamsByParent,
      );
      for (const nested of nestedUnder) {
        renderTeam(nested, id, id);
      }
    }

    for (const nested of nestedDirect) {
      if (nested.headId && nested.headId !== head.id) continue;
      renderTeam(nested, teamNodeId, null);
    }
  };

  for (const team of rootTeams) {
    renderTeam(team, head.id, null);
  }

  const unassigned = sortPeople(
    members.filter((m) => !m.teamId && m.id !== head.id),
  );

  if (unassigned.length > 0) {
    const unassignedIds = new Set([head.id, ...unassigned.map((u) => u.id)]);
    const unassignedPeople = [head, ...unassigned];
    const childMap = buildDeptChildMap(unassignedPeople, unassignedIds);
    for (const person of unassigned) {
      if (person.managerId && unassignedIds.has(person.managerId)) continue;
      const list = childMap.get(head.id) ?? [];
      if (!list.some((p) => p.id === person.id)) {
        list.push(person);
        childMap.set(head.id, list);
      }
    }
    for (const [key, list] of childMap) {
      childMap.set(key, sortPeople(list));
    }

    const visible = new Set<string>([head.id]);
    const visit = (person: Person) => {
      if (person.id !== head.id) {
        if (visible.has(person.id)) return;
        visible.add(person.id);
      }
      if (collapsed.has(person.id) && person.id !== head.id) return;
      for (const child of childMap.get(person.id) ?? []) {
        visit(child);
      }
    };
    visit(head);

    for (const id of visible) {
      if (id === head.id) continue;
      const person = unassigned.find((u) => u.id === id);
      if (!person) continue;
      const children = (childMap.get(id) ?? []).filter((c) => c.id !== id);
      const hasPersonChildren = children.length > 0;
      pushPersonNode(person, {
        hasChildren: hasPersonChildren,
        canCollapse: hasPersonChildren,
        isExpanded: hasPersonChildren ? !collapsed.has(person.id) : false,
      });
    }

    for (const managerId of visible) {
      if (collapsed.has(managerId) && managerId !== head.id) continue;
      for (const child of childMap.get(managerId) ?? []) {
        if (!visible.has(child.id) || child.id === head.id) continue;
        pushEdge(managerId, child.id);
      }
    }
  }

  return { nodes, edges, head };
}

export type { OrgChartNode, Node };
