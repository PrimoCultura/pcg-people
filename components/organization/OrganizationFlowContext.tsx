"use client";

import { createContext, useContext } from "react";

export type OrganizationFlowActions = {
  /** Expand/collapse person or virtual department node by graph node id. */
  toggleExpand: (nodeId: string) => void;
  openAreaManager: (personId: string) => void;
  openProfile: (personId: string) => void;
  openDepartment: (departmentId: string) => void;
};

const OrganizationFlowContext = createContext<OrganizationFlowActions | null>(
  null,
);

export function OrganizationFlowProvider({
  value,
  children,
}: {
  value: OrganizationFlowActions;
  children: React.ReactNode;
}) {
  return (
    <OrganizationFlowContext.Provider value={value}>
      {children}
    </OrganizationFlowContext.Provider>
  );
}

export function useOrganizationFlowActions(): OrganizationFlowActions {
  const ctx = useContext(OrganizationFlowContext);
  if (!ctx) {
    throw new Error(
      "useOrganizationFlowActions must be used within OrganizationFlowProvider",
    );
  }
  return ctx;
}
