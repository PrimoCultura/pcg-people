/**
 * Admin authorization helpers for Convex mutations.
 * Today: shared temporary password (ADMIN_PASSWORD / "1234").
 * Tomorrow: replace assertAdminAccess with identity/role checks.
 */
import { userError } from "./validators";

export type AdminAccessArgs = {
  /** Temporary shared password — remove when real auth lands */
  adminPassword?: string;
};

/**
 * Gate for privileged admin mutations.
 * Structured so a future identity check can replace the password branch
 * without changing call sites.
 */
export function assertAdminAccess(args: AdminAccessArgs = {}): void {
  // Future: if (identity && hasAdminRole(identity)) return;

  const expected = process.env.ADMIN_PASSWORD?.trim() || "1234";
  if (!args.adminPassword || args.adminPassword !== expected) {
    userError("Non autorizzato. Accedi all’area Admin e riprova.");
  }
}
