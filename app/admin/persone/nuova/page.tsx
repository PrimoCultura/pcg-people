"use client";

import { PersonForm } from "@/components/admin/PersonForm";
import { AdminGateMessage } from "@/components/admin/AdminGateMessage";
import { isConvexConfigured } from "@/components/providers/ConvexClientProvider";

export default function AdminNewPersonPage() {
  if (!isConvexConfigured()) return <AdminGateMessage />;
  return <PersonForm />;
}
