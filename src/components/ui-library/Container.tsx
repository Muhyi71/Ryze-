import React from "react";

interface ContainerProps {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
  children?: React.ReactNode;
}

const maxWidthClasses: Record<string, string> = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const padClasses: Record<string, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-6",
  lg: "p-10",
};

export function Container({
  maxWidth = "lg",
  padding = "md",
  centered = true,
  children,
}: ContainerProps) {
  return (
    <div
      className={[
        "w-full",
        maxWidthClasses[maxWidth],
        padClasses[padding],
        centered ? "mx-auto" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
