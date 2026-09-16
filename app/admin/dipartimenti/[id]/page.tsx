"use client";

import { use } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { DepartmentForm } from "@/components/admin/DepartmentForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminEditDepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <DepartmentForm departmentId={id as Id<"departments">} />;
}
