"use client";

import { createContext, useContext } from "react";

export type OrganizationFlowActions = {
  toggleExpand: (personId: string) => void;
  openAreaManager: (personId: string) => void;
  openProfile: (personId: string) => void;
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
