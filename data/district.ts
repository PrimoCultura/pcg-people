/**
 * District entity — territorial unit of the PCG network.
 * Manager is resolved via managerId → Person.id.
 */
export type District = {
  id: string;
  name: string;
  shortName?: string;
  /** District Manager Person id */
  managerId: string;
  description?: string;
  order?: number;
};
