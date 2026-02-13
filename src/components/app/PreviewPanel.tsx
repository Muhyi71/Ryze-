/* ────────────────────────────────────────────
   Preview Panel – Live rendered UI
   ──────────────────────────────────────────── */

"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { DynamicRenderer } from "./DynamicRenderer";

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportWidths: Record<ViewportSize, string> = {
  desktop: "w-full",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

export function PreviewPanel() {
  const { currentTree, isGenerating } = useAppStore();
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-gray-700">Live Preview</span>
          {isGenerating && (
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">
              Generating…
            </span>
          )}
        </div>

        {/* Viewport switcher */}
        {currentTree && (
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {(["desktop", "tablet", "mobile"] as ViewportSize[]).map((vp) => (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                className={[
                  "px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors",
                  viewport === vp
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600",
                ].join(" ")}
              >
                {vp === "desktop" ? "🖥" : vp === "tablet" ? "📱" : "📲"}{" "}
                <span className="hidden sm:inline capitalize">{vp}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-white flex justify-center">
        <div className={`${viewportWidths[viewport]} w-full transition-all duration-300`}>
          <DynamicRenderer tree={currentTree} />
        </div>
      </div>
    </div>
  );
}
