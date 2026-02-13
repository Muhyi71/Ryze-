/* ────────────────────────────────────────────
   Version Timeline – Rollback panel
   ──────────────────────────────────────────── */

"use client";

import React from "react";
import { useAppStore } from "@/lib/store";

export function VersionTimeline() {
  const { versions, currentVersionIndex, rollbackToVersion, clearChat } = useAppStore();

  if (versions.length === 0) return null;

  return (
    <div className="flex flex-col bg-white border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-semibold text-gray-700">
            Version History
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {versions.length}
          </span>
        </div>
        <button
          onClick={clearChat}
          className="text-[10px] text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Version list */}
      <div className="flex gap-1.5 p-2 overflow-x-auto">
        {versions.map((v, idx) => {
          const isActive = idx === currentVersionIndex;
          const time = new Date(v.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <button
              key={v.id}
              onClick={() => rollbackToVersion(idx)}
              title={v.label}
              className={[
                "flex-shrink-0 px-3 py-2 rounded-lg text-xs transition-all border min-w-[80px]",
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50",
              ].join(" ")}
            >
              <div className="font-bold">v{idx + 1}</div>
              <div
                className={`text-[10px] mt-0.5 truncate max-w-[100px] ${
                  isActive ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {v.label}
              </div>
              <div
                className={`text-[9px] mt-0.5 ${
                  isActive ? "text-blue-300" : "text-gray-300"
                }`}
              >
                {time}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
