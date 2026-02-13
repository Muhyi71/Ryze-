import React from "react";

interface NavItem {
  label: string;
  active?: boolean;
}

interface NavbarProps {
  title: string;
  items?: NavItem[];
  sticky?: boolean;
}

export function Navbar({ title, items = [], sticky = false }: NavbarProps) {
  return (
    <header
      className={[
        "w-full flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200",
        sticky ? "sticky top-0 z-40" : "",
      ].join(" ")}
    >
      <span className="text-lg font-bold text-gray-900">{title}</span>
      {items.length > 0 && (
        <nav className="flex items-center gap-1">
          {items.map((item, idx) => (
            <span
              key={idx}
              className={[
                "px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors",
                item.active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100",
              ].join(" ")}
            >
              {item.label}
            </span>
          ))}
        </nav>
      )}
    </header>
  );
}
