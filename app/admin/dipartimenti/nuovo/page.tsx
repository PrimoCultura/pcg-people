"use client";

import { DepartmentForm } from "@/components/admin/DepartmentForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminNewDepartmentPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <DepartmentForm />;
}
