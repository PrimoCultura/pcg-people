/**
 * Team entity — organizational unit within a department.
 * Members are derived from Person.teamId; headId is the team lead
 * (independent from people.managerId).
 */
export type Team = {
  id: string;
  name: string;
  slug?: string;
  departmentId: string;
  /** Person id of the team head */
  headId?: string;
  description?: string;
  order?: number;
  /** Resolved display fields (optional, from enriched queries) */
  departmentLabel?: string;
  headName?: string | null;
  headRole?: string | null;
  memberCount?: number;
};
