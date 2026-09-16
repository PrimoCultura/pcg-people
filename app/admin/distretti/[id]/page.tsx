"use client";

import { use } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { DistrictForm } from "@/components/admin/DistrictForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminEditDistrictPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <DistrictForm districtId={id as Id<"districts">} />;
}
