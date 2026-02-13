/* ────────────────────────────────────────────
   AI Agent – Prompt Templates
   REQUIREMENT: "Prompt separation must be visible in code"
   Each agent step has its own prompt template.
   ──────────────────────────────────────────── */

import { schemasToPromptText } from "@/components/ui-library/registry";
import type { ComponentNode, Plan } from "@/types";

// ─── System preamble shared across all steps ────────────────

const SYSTEM_PREAMBLE = `You are a deterministic UI code generator. You must ONLY use the fixed component library provided below. You may NEVER:
- Create new components
- Use inline styles
- Generate CSS or arbitrary Tailwind classes
- Import external libraries
- Deviate from the component schemas

FIXED COMPONENT LIBRARY:
${schemasToPromptText()}
`;

// ─── 1. PLANNER PROMPT ──────────────────────────────────────

export function buildPlannerPrompt(
  userMessage: string,
  currentTree: ComponentNode | null,
  mode: "generate" | "modify"
): { system: string; user: string } {
  const system = `${SYSTEM_PREAMBLE}

You are the PLANNER step of a UI agent pipeline.
Your job is to interpret the user's intent and output a structured JSON plan.

Rules:
- Only select components from the fixed library above
- Choose an appropriate layout structure
- If mode is "modify", describe ONLY what should change (do NOT rewrite everything)
- Output valid JSON and nothing else

Output format (JSON only):
{
  "intent": "concise summary of what the user wants",
  "layout": "description of the layout structure (e.g., sidebar + main content, full-width stacked, grid layout)",
  "components": ["list", "of", "component", "names", "to use"],
  "structure": "brief description of the component tree hierarchy",
  "isModification": ${mode === "modify"},
  "modifications": ["list of specific changes to make (only if modifying)"]
}`;

  const currentContext =
    mode === "modify" && currentTree
      ? `\n\nCURRENT UI TREE (for reference – modify this, do NOT rewrite from scratch):\n${JSON.stringify(currentTree, null, 2)}`
      : "";

  const user = `User request: "${userMessage}"${currentContext}\n\nRespond with the JSON plan only, no markdown fences.`;

  return { system, user };
}

// ─── 2. GENERATOR PROMPT ────────────────────────────────────

export function buildGeneratorPrompt(
  plan: Plan,
  currentTree: ComponentNode | null,
  mode: "generate" | "modify"
): { system: string; user: string } {
  const system = `${SYSTEM_PREAMBLE}

You are the GENERATOR step of a UI agent pipeline.
Your job is to convert the plan into a ComponentNode JSON tree.

ComponentNode shape:
{
  "id": "unique-string",
  "type": "ComponentName",       // MUST be from allowed list
  "props": { ... },              // MUST match component schema
  "children": [ ComponentNode | "text string" ]
}

CRITICAL RULES:
- Every "type" MUST be an allowed component name
- Every prop MUST match the schema for that component
- IDs must be unique strings (use descriptive names like "main-container", "header-nav", etc.)
- For components that don't accept children, use an empty array []
- For text content within container components, use string children
- Array props like "columns", "data", "items" must be valid JSON arrays
- If modifying, preserve existing IDs where components aren't changing
- Do NOT output anything other than the JSON tree

Allowed components: Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart, Container, Stack, Grid, Section, Text, Badge, Divider`;

  const currentContext =
    mode === "modify" && currentTree
      ? `\n\nCURRENT TREE (modify this incrementally):\n${JSON.stringify(currentTree, null, 2)}`
      : "";

  const user = `PLAN:\n${JSON.stringify(plan, null, 2)}${currentContext}\n\nGenerate the ComponentNode JSON tree. Output JSON only, no markdown fences.`;

  return { system, user };
}

// ─── 3. EXPLAINER PROMPT ────────────────────────────────────

export function buildExplainerPrompt(
  plan: Plan,
  tree: ComponentNode,
  userMessage: string,
  mode: "generate" | "modify"
): { system: string; user: string } {
  const system = `You are the EXPLAINER step of a UI agent pipeline.
Your job is to explain the AI's decisions in plain English.

Requirements:
- Reference specific component choices and why they were selected
- Explain the layout structure
- If this was a modification, explain what changed and what was preserved
- Keep it concise but insightful (3-6 sentences)
- Use bullet points for listing changes
- Be specific about component names and props chosen`;

  const user = `User's request: "${userMessage}"
Mode: ${mode}

Plan:
${JSON.stringify(plan, null, 2)}

Generated tree summary:
- Root type: ${tree.type}
- Components used: ${collectComponentTypes(tree).join(", ")}
- Total nodes: ${countNodes(tree)}
${mode === "modify" ? `- This was an incremental modification` : "- This was a fresh generation"}

Write the explanation. Plain text, no JSON.`;

  return { system, user };
}

// ─── Helpers ────────────────────────────────────────────────

function collectComponentTypes(node: ComponentNode): string[] {
  const types = new Set<string>();
  function walk(n: ComponentNode) {
    types.add(n.type);
    for (const child of n.children) {
      if (typeof child !== "string") walk(child);
    }
  }
  walk(node);
  return Array.from(types);
}

function countNodes(node: ComponentNode): number {
  let count = 1;
  for (const child of node.children) {
    if (typeof child !== "string") count += countNodes(child);
  }
  return count;
}
