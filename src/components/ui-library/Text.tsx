import React from "react";

interface TextProps {
  content: string;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "label";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "default" | "muted" | "primary" | "danger" | "success";
  align?: "left" | "center" | "right";
}

const variantClasses: Record<string, string> = {
  h1: "text-3xl",
  h2: "text-2xl",
  h3: "text-xl",
  h4: "text-lg",
  body: "text-base",
  caption: "text-xs",
  label: "text-sm uppercase tracking-wide",
};

const weightClasses: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorClasses: Record<string, string> = {
  default: "text-gray-900",
  muted: "text-gray-500",
  primary: "text-blue-600",
  danger: "text-red-600",
  success: "text-green-600",
};

const alignClasses: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Text({
  content,
  variant = "body",
  weight = "normal",
  color = "default",
  align = "left",
}: TextProps) {
  return (
    <p
      className={[
        variantClasses[variant],
        weightClasses[weight],
        colorClasses[color],
        alignClasses[align],
      ].join(" ")}
    >
      {content}
    </p>
  );
}
