import { ConvexError } from "convex/values";

/** Extract a user-facing Italian message from Convex mutation errors. */
export function getConvexUserMessage(
  error: unknown,
  fallback = "Si è verificato un errore. Riprova.",
): string {
  if (error instanceof ConvexError) {
    const data = error.data as { message?: string; code?: string } | string;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object" && typeof data.message === "string") {
      return data.message;
    }
  }
  if (error instanceof Error && error.message) {
    // Avoid leaking raw Convex stack / request ids
    if (
      error.message.includes("ConvexError") ||
      error.message.includes("[CONVEX")
    ) {
      // Try to extract USER_ERROR message from serialized payloads
      const match = error.message.match(/"message"\s*:\s*"([^"]+)"/);
      if (match?.[1]) return match[1];
      return fallback;
    }
    // Some Convex clients surface the user message directly
    if (
      error.message.startsWith("Non puoi") ||
      error.message.startsWith("Non è possibile")
    ) {
      return error.message;
    }
  }
  return fallback;
}
