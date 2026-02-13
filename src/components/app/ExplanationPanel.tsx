/* ────────────────────────────────────────────
   Explanation Panel – Shows AI reasoning
   ──────────────────────────────────────────── */

"use client";

import React from "react";
import { useAppStore } from "@/lib/store";

export function ExplanationPanel() {
  const { explanation, versions, currentVersionIndex } = useAppStore();
  const currentVersion = currentVersionIndex >= 0 ? versions[currentVersionIndex] : null;

  if (!explanation && !currentVersion) return null;

  return (
    <div className="flex-1 overflow-auto bg-amber-50 border-t border-amber-200">
      <div className="px-5 py-3 border-b border-amber-200">
        <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
          💡 AI Reasoning
          {currentVersion && (
            <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-2">
              v{currentVersionIndex + 1} — {currentVersion.label}
            </span>
          )}
        </span>
      </div>
      <div className="px-5 py-4 text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
        {explanation}
      </div>
      {currentVersion && (
        <div className="px-5 py-3 border-t border-amber-200 bg-amber-100/50">
          <details className="text-xs text-amber-800">
            <summary className="cursor-pointer font-semibold hover:text-amber-900">
              📋 View Plan Details
            </summary>
            <div className="mt-3 space-y-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-semibold text-gray-700 mb-1">Intent</p>
                <p className="text-gray-600">{currentVersion.plan.intent}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-semibold text-gray-700 mb-1">Layout</p>
                <p className="text-gray-600">{currentVersion.plan.layout}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-semibold text-gray-700 mb-1">Components</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentVersion.plan.components.map((c) => (
                    <span
                      key={c}
                      className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] border border-blue-100"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {currentVersion.plan.modifications && currentVersion.plan.modifications.length > 0 && (
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-semibold text-gray-700 mb-1">Modifications</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                    {currentVersion.plan.modifications.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
