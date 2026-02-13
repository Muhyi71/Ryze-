import React from "react";

interface GridProps {
  columns?: "1" | "2" | "3" | "4" | "6" | "12";
  gap?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const colClasses: Record<string, string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
  "6": "grid-cols-6",
  "12": "grid-cols-12",
};

const gapClasses: Record<string, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

export function Grid({
  columns = "2",
  gap = "md",
  children,
}: GridProps) {
  return (
    <div
      className={[
        "grid",
        colClasses[columns],
        gapClasses[gap],
      ].join(" ")}
    >
      {children}
    </div>
  );
}
