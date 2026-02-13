import React from "react";

interface SidebarItem {
  label: string;
  icon?: string;
  active?: boolean;
}

interface SidebarProps {
  title?: string;
  items: SidebarItem[];
  collapsed?: boolean;
}

const ICONS: Record<string, string> = {
  home: "🏠",
  settings: "⚙️",
  user: "👤",
  chart: "📊",
  mail: "📧",
  folder: "📁",
  search: "🔍",
  bell: "🔔",
  star: "⭐",
  heart: "❤️",
  file: "📄",
  calendar: "📅",
  lock: "🔒",
  globe: "🌐",
  link: "🔗",
  list: "📋",
};

export function Sidebar({ title, items = [], collapsed = false }: SidebarProps) {
  return (
    <aside
      className={[
        "flex flex-col bg-gray-900 text-white h-full",
        collapsed ? "w-16" : "w-56",
      ].join(" ")}
    >
      {title && !collapsed && (
        <div className="px-4 py-5 text-base font-bold border-b border-gray-700">
          {title}
        </div>
      )}
      <nav className="flex-1 py-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={[
              "flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors",
              item.active
                ? "bg-blue-600/20 text-blue-400 border-r-2 border-blue-400"
                : "text-gray-300 hover:bg-gray-800 hover:text-white",
            ].join(" ")}
          >
            <span className="text-base">
              {item.icon && ICONS[item.icon] ? ICONS[item.icon] : "•"}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}
