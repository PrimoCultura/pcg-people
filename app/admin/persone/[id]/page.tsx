"use client";

import { use } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { PersonForm } from "@/components/admin/PersonForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminEditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <PersonForm personId={id as Id<"people">} />;
}
