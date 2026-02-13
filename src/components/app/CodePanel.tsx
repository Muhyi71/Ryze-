/* ────────────────────────────────────────────
   Code Panel – Editable code viewer with diff
   ──────────────────────────────────────────── */

"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { DiffView } from "./DiffView";

type ViewMode = "code" | "diff";

export function CodePanel() {
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [copied, setCopied] = useState(false);
  const { currentCode, updateCode, versions, currentVersionIndex } = useAppStore();
  const currentVersion = currentVersionIndex >= 0 ? versions[currentVersionIndex] : null;
  const prevVersion = currentVersionIndex > 0 ? versions[currentVersionIndex - 1] : null;

  const handleCopy = () => {
    if (currentCode) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#181825]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">GeneratedUI.tsx</span>
          {currentVersion && (
            <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
              v{currentVersionIndex + 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Diff toggle (only when there's a previous version) */}
          {prevVersion && (
            <button
              onClick={() => setViewMode(viewMode === "code" ? "diff" : "code")}
              className={[
                "text-[10px] px-2 py-1 rounded transition-colors",
                viewMode === "diff"
                  ? "bg-purple-900/50 text-purple-300"
                  : "text-gray-400 hover:text-white hover:bg-gray-700",
              ].join(" ")}
            >
              {viewMode === "diff" ? "✦ Diff" : "Diff"}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === "diff" && prevVersion ? (
          <DiffView
            oldCode={prevVersion.jsxCode}
            newCode={currentCode}
            oldLabel={`v${currentVersionIndex}`}
            newLabel={`v${currentVersionIndex + 1}`}
          />
        ) : currentCode ? (
          <textarea
            value={currentCode}
            onChange={(e) => updateCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-transparent text-gray-300 font-mono text-xs leading-6 p-4 resize-none outline-none"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <div className="text-center">
              <div className="text-3xl mb-3">📝</div>
              <p className="font-medium">No code generated</p>
              <p className="text-xs mt-1 text-gray-600">Generated JSX will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
