/**
 * Admin entry visibility + access helpers.
 *
 * With temporary password auth in place, the Admin link is always shown.
 * Middleware + /admin/login enforce the password session.
 *
 * Tomorrow: pass isAdminUser from real auth and optionally hide the link
 * for non-admins via shouldShowAdminLink(context).
 */

export type AdminAccessContext = {
  /** Will become: authenticated user has admin role */
  isAdminUser?: boolean;
};

export function canAccessAdmin(context: AdminAccessContext = {}): boolean {
  if (typeof context.isAdminUser === "boolean") {
    return context.isAdminUser;
  }
  // Temporary: Admin is discoverable; password gate protects the routes.
  return true;
}

export function shouldShowAdminLink(
  context: AdminAccessContext = {},
): boolean {
  return canAccessAdmin(context);
}

export const adminNavItem = {
  label: "Admin",
  href: "/admin",
} as const;
