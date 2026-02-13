/* ────────────────────────────────────────────
   Chat Panel – Left sidebar with chat input
   Supports: generate, modify, regenerate
   ──────────────────────────────────────────── */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import type { GenerateResponse } from "@/types";

const EXAMPLE_PROMPTS = [
  "Create a dashboard with a sidebar, navbar and two charts",
  "Build a user profile card with name, email and a badge",
  "Design a pricing table with 3 columns",
  "Make a contact form with name, email, and message inputs",
  "Create a landing page with hero section and feature grid",
];

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [agentStep, setAgentStep] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isGenerating,
    currentTree,
    error,
    addMessage,
    setGenerating,
    setError,
    applyGeneration,
  } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Core send handler ────────────────────── */
  const sendMessage = async (msg: string) => {
    if (!msg || isGenerating) return;

    setInput("");
    addMessage("user", msg);
    setGenerating(true);
    setError(null);
    setAgentStep("Planning…");

    try {
      const mode = currentTree ? "modify" : "generate";

      // Use streaming endpoint
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, currentTree, mode }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // Parse SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: GenerateResponse["result"] | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;

          try {
            const event = JSON.parse(payload);
            if (event.type === "step") {
              setAgentStep(event.step);
            } else if (event.type === "result") {
              finalResult = event.data;
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch {
            // Ignore malformed JSON lines
          }
        }
      }

      if (finalResult) {
        addMessage("assistant", finalResult.explanation);
        applyGeneration(finalResult, msg);
      } else {
        throw new Error("No result received from pipeline");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      addMessage("assistant", `❌ Error: ${errMsg}`);
      setError(errMsg);
    } finally {
      setGenerating(false);
      setAgentStep(null);
    }
  };

  const handleSend = () => sendMessage(input.trim());

  /* ── Regenerate: re-run last user message ── */
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) sendMessage(lastUserMsg.content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Ryze AI Agent
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
         3-step pipeline: Planner → Generator → Explainer
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="py-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-lg">✨</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">What would you like to build?</p>
              <p className="text-xs text-gray-500 mt-1">
                Describe a UI and I&apos;ll generate it using the fixed component library
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                Try an example
              </p>
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm",
              ].join(" ")}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[10px] mt-1.5 ${
                  msg.role === "user" ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs">{agentStep || "Processing…"}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Regenerate button */}
      {messages.length > 0 && !isGenerating && (
        <div className="px-3 pt-2 bg-gray-50">
          <button
            onClick={handleRegenerate}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 rounded-lg hover:bg-blue-50 transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentTree
                ? "Describe a modification…"
                : "Describe a UI to generate…"
            }
            disabled={isGenerating}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="self-end px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
