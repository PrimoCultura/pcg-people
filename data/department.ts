/**
 * Department entity — shaped for a future Convex schema.
 * Members are derived from Person.departmentId, never duplicated here.
 */
export type Department = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Person id of the department head */
  headId?: string;
  contactFor: string[];
  tags: string[];
  /** Sort order for HQ directory; omit for non-HQ (e.g. Network) */
  order?: number;
};
