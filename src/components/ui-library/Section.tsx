import React from "react";

interface SectionProps {
  title?: string;
  description?: string;
  padding?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const padClasses: Record<string, string> = {
  none: "py-0",
  sm: "py-3",
  md: "py-6",
  lg: "py-10",
};

export function Section({
  title,
  description,
  padding = "md",
  children,
}: SectionProps) {
  return (
    <section className={padClasses[padding]}>
      {title && <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>}
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {children}
    </section>
  );
}
