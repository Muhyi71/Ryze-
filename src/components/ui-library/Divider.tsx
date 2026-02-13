import React from "react";

interface DividerProps {
  spacing?: "sm" | "md" | "lg";
}

const spacingClasses: Record<string, string> = {
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
};

export function Divider({ spacing = "md" }: DividerProps) {
  return <hr className={`border-t border-gray-200 ${spacingClasses[spacing]}`} />;
}
