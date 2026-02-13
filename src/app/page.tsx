/* ────────────────────────────────────────────
   Main Page – Three-Panel Layout (Claude-style)
   Left:   Chat Panel
   Center: Live Preview (+Explanation +Timeline)
   Right:  Code Panel (with Diff view)
   ──────────────────────────────────────────── */

"use client";

import React, { useState } from "react";
import { ChatPanel } from "@/components/app/ChatPanel";
import { CodePanel } from "@/components/app/CodePanel";
import { PreviewPanel } from "@/components/app/PreviewPanel";
import { ExplanationPanel } from "@/components/app/ExplanationPanel";
import { VersionTimeline } from "@/components/app/VersionTimeline";
import { useAppStore } from "@/lib/store";

type CenterTab = "preview" | "explanation";

export default function HomePage() {
  const [activePanel, setActivePanel] = useState<"preview" | "code">("preview");
  const [centerTab, setCenterTab] = useState<CenterTab>("preview");
  const { currentTree, versions } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* ── Top bar ─────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Ryze AI</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                UI Generator
              </span>
            </div>
            <p className="text-[10px] text-gray-400 -mt-0.5 hidden sm:block">
              Deterministic Component System 
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pipeline indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="text-blue-500">Planner</span>
            <span>→</span>
            <span className="text-purple-500">Generator</span>
            <span>→</span>
            <span className="text-green-500">Explainer</span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200" />
            <span className="text-[10px] text-gray-500 hidden sm:inline">Ready</span>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-80 flex-shrink-0 hidden md:flex flex-col">
          <ChatPanel />
        </div>

        {/* Center + Right */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile tab switcher */}
          <div className="flex items-center border-b border-gray-200 bg-white md:hidden px-2">
            <button
              onClick={() => setActivePanel("preview")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activePanel === "preview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActivePanel("code")}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activePanel === "code"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              Code
            </button>
          </div>

          {/* Desktop: Side by side */}
          <div className="flex-1 flex overflow-hidden">
            {/* Center: Preview + Explanation + Timeline */}
            <div
              className={`flex-1 flex flex-col overflow-hidden ${
                activePanel !== "preview" ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Center tabs (only show when we have content) */}
              {currentTree && (
                <div className="flex items-center border-b border-gray-200 bg-white px-3">
                  <button
                    onClick={() => setCenterTab("preview")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      centerTab === "preview"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ◎ Live Preview
                  </button>
                  <button
                    onClick={() => setCenterTab("explanation")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      centerTab === "explanation"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    💡 Explanation
                  </button>
                  {versions.length > 0 && (
                    <div className="ml-auto">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {versions.length} version{versions.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              <div
                className={`flex-1 overflow-auto ${
                  centerTab !== "preview" && currentTree ? "hidden" : "block"
                }`}
              >
                <PreviewPanel />
              </div>

              {/* Explanation (full view) */}
              {centerTab === "explanation" && currentTree && <ExplanationPanel />}

              {/* Version timeline (always visible if versions exist) */}
              <VersionTimeline />
            </div>

            {/* Right: Code */}
            <div
              className={`w-full md:w-[420px] lg:w-[480px] flex-shrink-0 border-l border-gray-200 ${
                activePanel !== "code" ? "hidden md:flex" : "flex"
              } flex-col`}
            >
              <CodePanel />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile chat toggle */}
      <MobileChatDrawer />
    </div>
  );
}

function MobileChatDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center text-lg z-50 hover:shadow-xl transition-shadow"
      >
        💬
      </button>

      {/* Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl">
            <ChatPanel />
          </div>
        </div>
      )}
    </>
  );
}
