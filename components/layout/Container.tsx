import type { HTMLAttributes, ReactNode } from "react";

type ContainerTag = "div" | "section" | "header" | "footer" | "main" | "nav";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ContainerTag;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

export function Container({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full max-w-pcg px-[var(--pcg-gutter)] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
