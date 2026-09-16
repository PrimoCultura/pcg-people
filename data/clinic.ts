/**
 * Clinic entity — physical clinic in the PCG network.
 * Area Manager and District are resolved via ids, never duplicated as names.
 */
export type Clinic = {
  id: string;
  name: string;
  city: string;
  region?: string;
  address?: string;
  districtId: string;
  /** Area Manager Person id */
  areaManagerId: string;
  active?: boolean;
  order?: number;
};
