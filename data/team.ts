/**
 * Team entity — organizational unit within a department.
 * Members are derived from Person.teamId; headId is the team lead
 * (independent from people.managerId).
 * parentTeamId optionally nests under another team in the same department.
 */
export type Team = {
  id: string;
  name: string;
  slug?: string;
  departmentId: string;
  /** Person id of the team head */
  headId?: string;
  /** Superior team in the same department (optional explicit nesting). */
  parentTeamId?: string;
  description?: string;
  order?: number;
  /** Resolved display fields (optional, from enriched queries) */
  departmentLabel?: string;
  headName?: string | null;
  headRole?: string | null;
  parentTeamName?: string | null;
  memberCount?: number;
};
