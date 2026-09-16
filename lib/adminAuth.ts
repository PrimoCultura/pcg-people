/**
 * Temporary Admin gate until real auth (Clerk / SSO) lands.
 * Password: ADMIN_PASSWORD env, fallback "1234" for the test phase.
 */

export const ADMIN_SESSION_COOKIE = "pcg_admin_session";

/** Opaque session marker set after successful login (not the password). */
export const ADMIN_SESSION_VALUE = "authenticated";

export const ADMIN_LOGIN_PATH = "/admin/login";

/** Confirmation phrase required for destructive database purge. */
export const PURGE_CONFIRM_PHRASE = "ELIMINA TUTTO";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "1234";
}

export function isValidAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}

export function isAdminSessionCookie(value: string | undefined): boolean {
  return value === ADMIN_SESSION_VALUE;
}
