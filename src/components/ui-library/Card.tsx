import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  padding?: "sm" | "md" | "lg";
  bordered?: boolean;
  hoverable?: boolean;
  children?: React.ReactNode;
}

const padClasses: Record<string, string> = {
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  title,
  subtitle,
  padding = "md",
  bordered = true,
  hoverable = false,
  children,
}: CardProps) {
  return (
    <div
      className={[
        "rounded-xl bg-white",
        padClasses[padding],
        bordered ? "border border-gray-200" : "shadow-sm",
        hoverable ? "transition-transform hover:scale-[1.01]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-3">{subtitle}</p>}
      {children}
    </div>
  );
}
