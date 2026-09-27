"use client";

import { use } from "react";
import { TeamForm } from "@/components/admin/TeamForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";
import type { Id } from "@/convex/_generated/dataModel";

export default function AdminEditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <TeamForm teamId={id as Id<"teams">} />;
}
