import Image from "next/image";
import {
  getPersonFullName,
  getPersonInitials,
  type Person,
} from "@/data/types";

type PersonAvatarProps = {
  person: Pick<Person, "firstName" | "lastName" | "photoUrl">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** When true, hides from assistive tech (e.g. decorative clusters). */
  decorative?: boolean;
};

const sizeClasses = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-base",
  xl: "h-24 w-24 text-xl sm:h-28 sm:w-28 sm:text-2xl",
} as const;

const sizePixels = {
  sm: 40,
  md: 48,
  lg: 64,
  xl: 112,
} as const;

/**
 * Avatar with optional photoUrl. Falls back to initials when no photo.
 * Designed so a real photo can be passed later without rewriting callers.
 */
export function PersonAvatar({
  person,
  size = "md",
  className = "",
  decorative = false,
}: PersonAvatarProps) {
  const name = getPersonFullName(person);
  const initials = getPersonInitials(person);
  const dimension = sizePixels[size];

  if (person.photoUrl) {
    const isBlob = person.photoUrl.startsWith("blob:");
    return (
      <Image
        src={person.photoUrl}
        alt={decorative ? "" : `Foto di ${name}`}
        width={dimension}
        height={dimension}
        unoptimized={isBlob}
        className={`shrink-0 rounded-full object-cover ${sizeClasses[size]} ${className}`}
        aria-hidden={decorative || undefined}
      />
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-pcg-avatar-bg font-semibold text-pcg-avatar-fg ${sizeClasses[size]} ${className}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
