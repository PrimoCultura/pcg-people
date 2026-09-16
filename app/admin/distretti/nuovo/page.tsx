"use client";

import { DistrictForm } from "@/components/admin/DistrictForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminNewDistrictPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <DistrictForm />;
}
