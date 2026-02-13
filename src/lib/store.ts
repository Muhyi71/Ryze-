/* ────────────────────────────────────────────
   App Store – Zustand with Version History
   ──────────────────────────────────────────── */

import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { AppState, ChatMessage, GenerationResult, Version } from "@/types";

export const useAppStore = create<AppState>((set, get) => ({
  messages: [],
  versions: [],
  currentVersionIndex: -1,
  currentTree: null,
  currentCode: "",
  isGenerating: false,
  explanation: "",
  error: null,

  addMessage: (role: ChatMessage["role"], content: string) => {
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: uuid(),
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    }));
  },

  setGenerating: (value: boolean) => set({ isGenerating: value }),

  setError: (error: string | null) => set({ error }),

  applyGeneration: (result: GenerationResult, userMessage: string) => {
    const version: Version = {
      id: uuid(),
      timestamp: Date.now(),
      label: userMessage.slice(0, 60),
      componentTree: result.componentTree,
      jsxCode: result.jsxCode,
      explanation: result.explanation,
      plan: result.plan,
    };

    set((s) => {
      // Trim any "future" versions if we rolled back then edited
      const versions = [...s.versions.slice(0, s.currentVersionIndex + 1), version];
      return {
        versions,
        currentVersionIndex: versions.length - 1,
        currentTree: result.componentTree,
        currentCode: result.jsxCode,
        explanation: result.explanation,
        error: null,
      };
    });
  },

  rollbackToVersion: (index: number) => {
    const { versions } = get();
    if (index < 0 || index >= versions.length) return;
    const v = versions[index];
    set({
      currentVersionIndex: index,
      currentTree: v.componentTree,
      currentCode: v.jsxCode,
      explanation: v.explanation,
    });
  },

  updateCode: (code: string) => set({ currentCode: code }),

  clearChat: () =>
    set({
      messages: [],
      versions: [],
      currentVersionIndex: -1,
      currentTree: null,
      currentCode: "",
      explanation: "",
      error: null,
    }),
}));
