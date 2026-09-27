"use client";

import { TeamForm } from "@/components/admin/TeamForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminNewTeamPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <TeamForm />;
}
