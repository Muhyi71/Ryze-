import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
}

export function Input({
  label,
  placeholder = "",
  type = "text",
  disabled = false,
  helperText,
  error = false,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors",
          error
            ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500"
            : "border-gray-300 bg-white text-gray-900 focus:border-blue-500",
          disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {helperText && (
        <span className={`text-xs ${error ? "text-red-500" : "text-gray-500"}`}>
          {helperText}
        </span>
      )}
    </div>
  );
}
