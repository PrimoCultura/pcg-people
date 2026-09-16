/**
 * Controls visibility of the Admin entry point in the public site chrome.
 *
 * Today (no auth yet):
 * - visible in development
 * - or when NEXT_PUBLIC_SHOW_ADMIN_LINK=true
 *
 * Tomorrow (after auth/roles):
 * replace `canAccessAdmin` with the real user-role check and keep
 * `shouldShowAdminLink` as the single gate used by the header.
 */

export type AdminAccessContext = {
  /** Will become: authenticated user has admin role */
  isAdminUser?: boolean;
};

/**
 * Whether the current viewer may access Admin.
 * Swap this implementation when Clerk (or equivalent) lands —
 * e.g. return Boolean(context.isAdminUser).
 */
export function canAccessAdmin(context: AdminAccessContext = {}): boolean {
  if (typeof context.isAdminUser === "boolean") {
    return context.isAdminUser;
  }

  if (process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true") {
    return true;
  }

  // Development default: keep Admin discoverable while building.
  return process.env.NODE_ENV === "development";
}

/** Header / mobile nav should call this — not invent their own condition. */
export function shouldShowAdminLink(
  context: AdminAccessContext = {},
): boolean {
  return canAccessAdmin(context);
}

export const adminNavItem = {
  label: "Admin",
  href: "/admin",
} as const;
