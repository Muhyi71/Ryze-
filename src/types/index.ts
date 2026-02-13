/* ────────────────────────────────────────────
   Ryze UI Generator – Shared Type Definitions
   ──────────────────────────────────────────── */

// ── Component Tree ──────────────────────────

export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: (ComponentNode | string)[];
}

// ── Agent Types ─────────────────────────────

export interface Plan {
  intent: string;
  layout: string;
  components: string[];
  structure: string;
  isModification: boolean;
  modifications?: string[];
}

export interface GenerationResult {
  plan: Plan;
  componentTree: ComponentNode;
  jsxCode: string;
  explanation: string;
}

// ── Version History ─────────────────────────

export interface Version {
  id: string;
  timestamp: number;
  label: string;
  componentTree: ComponentNode;
  jsxCode: string;
  explanation: string;
  plan: Plan;
}

// ── Chat Messages ───────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

// ── API Types ───────────────────────────────

export interface GenerateRequest {
  message: string;
  currentTree: ComponentNode | null;
  mode: "generate" | "modify";
}

export interface GenerateResponse {
  success: boolean;
  result?: GenerationResult;
  error?: string;
}

// ── Component Prop Schemas (for AI context) ─

export interface PropSchema {
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
  description: string;
}

export interface ComponentSchema {
  name: string;
  description: string;
  acceptsChildren: boolean;
  props: PropSchema[];
}

// ── Store State ─────────────────────────────

export interface AppState {
  messages: ChatMessage[];
  versions: Version[];
  currentVersionIndex: number;
  currentTree: ComponentNode | null;
  currentCode: string;
  isGenerating: boolean;
  explanation: string;
  error: string | null;

  // Actions
  addMessage: (role: ChatMessage["role"], content: string) => void;
  setGenerating: (value: boolean) => void;
  setError: (error: string | null) => void;
  applyGeneration: (result: GenerationResult, userMessage: string) => void;
  rollbackToVersion: (index: number) => void;
  updateCode: (code: string) => void;
  clearChat: () => void;
}
