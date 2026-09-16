"use client";

import { ClinicForm } from "@/components/admin/ClinicForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminNewClinicPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <ClinicForm />;
}
