"use client";

import { use } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ClinicForm } from "@/components/admin/ClinicForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminEditClinicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <ClinicForm clinicId={id as Id<"clinics">} />;
}
