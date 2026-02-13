/* ────────────────────────────────────────────
   AI Agent – Pipeline Orchestrator
   Runs: Planner → Generator → Explainer
   ──────────────────────────────────────────── */

import OpenAI from "openai";
import { buildPlannerPrompt, buildGeneratorPrompt, buildExplainerPrompt } from "./prompts";
import { validateTree } from "@/lib/safety/validator";
import { treeToJsx } from "@/lib/renderer/tree-to-jsx";
import type { ComponentNode, Plan, GenerationResult } from "@/types";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const BASE_URL = process.env.OPENAI_BASE_URL || undefined;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY!;
  // Auto-detect OpenRouter keys (sk-or-*) and set base URL accordingly
  const isOpenRouter = apiKey?.startsWith("sk-or-");
  const baseURL = BASE_URL || (isOpenRouter ? "https://openrouter.ai/api/v1" : undefined);

  return new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
}

async function callLLM(system: string, user: string, maxTokens: number = 3000): Promise<string> {
  const client = getClient();
  
  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.1,          // Low temp for determinism
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return res.choices[0]?.message?.content?.trim() || "";
  } catch (err: unknown) {
    // Provide clear error messages for common issues
    if (err && typeof err === "object" && "status" in err) {
      const apiErr = err as { status: number; message?: string; code?: string };
      if (apiErr.status === 429) {
        throw new Error("API quota exceeded — please add billing credits to your account");
      }
      if (apiErr.status === 402) {
        throw new Error("Insufficient credits — please top up at https://openrouter.ai/settings/credits");
      }
      if (apiErr.status === 401) {
        throw new Error("Invalid API key — check your OPENAI_API_KEY in .env.local");
      }
      if (apiErr.status === 404) {
        throw new Error(`Model "${MODEL}" not found — check OPENAI_MODEL in .env.local`);
      }
    }
    throw err;
  }
}

function parseJSON<T>(raw: string): T {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned);
}

// ─── Step 1: PLANNER ───────────────────────────────────────

async function runPlanner(
  message: string,
  currentTree: ComponentNode | null,
  mode: "generate" | "modify"
): Promise<Plan> {
  console.log("[Agent] Step 1: Planner");
  const { system, user } = buildPlannerPrompt(message, currentTree, mode);
  const raw = await callLLM(system, user, 1000);
  const plan = parseJSON<Plan>(raw);

  // Ensure required fields
  if (!plan.intent || !plan.layout || !plan.components) {
    throw new Error("Planner returned incomplete plan");
  }

  console.log("[Agent] Plan:", plan.intent);
  return plan;
}

// ─── Step 2: GENERATOR ─────────────────────────────────────

async function runGenerator(
  plan: Plan,
  currentTree: ComponentNode | null,
  mode: "generate" | "modify"
): Promise<ComponentNode> {
  console.log("[Agent] Step 2: Generator");
  const { system, user } = buildGeneratorPrompt(plan, currentTree, mode);
  const raw = await callLLM(system, user, 3000);
  const tree = parseJSON<ComponentNode>(raw);

  // Validate the tree against the component whitelist
  const validation = validateTree(tree);
  if (!validation.valid) {
    console.warn("[Agent] Validation warnings:", validation.errors);
    // Attempt auto-fix by filtering invalid nodes
    if (validation.sanitized) {
      return validation.sanitized;
    }
    throw new Error(`Generated tree failed validation: ${validation.errors.join("; ")}`);
  }

  console.log("[Agent] Tree generated, root type:", tree.type);
  return tree;
}

// ─── Step 3: EXPLAINER ─────────────────────────────────────

async function runExplainer(
  plan: Plan,
  tree: ComponentNode,
  userMessage: string,
  mode: "generate" | "modify"
): Promise<string> {
  console.log("[Agent] Step 3: Explainer");
  const { system, user } = buildExplainerPrompt(plan, tree, userMessage, mode);
  const explanation = await callLLM(system, user, 800);
  return explanation;
}

// ─── Full Pipeline ─────────────────────────────────────────

export async function runAgentPipeline(
  message: string,
  currentTree: ComponentNode | null,
  mode: "generate" | "modify"
): Promise<GenerationResult> {
  return runAgentPipelineStreaming(message, currentTree, mode);
}

/** Streaming-aware pipeline with step callbacks */
export async function runAgentPipelineStreaming(
  message: string,
  currentTree: ComponentNode | null,
  mode: "generate" | "modify",
  onStep?: (stepName: string) => void
): Promise<GenerationResult> {
  // Step 1: Plan
  onStep?.("🧠 Step 1/3 — Planning layout & components…");
  const plan = await runPlanner(message, currentTree, mode);

  // Step 2: Generate tree
  onStep?.("⚙️ Step 2/3 — Generating component tree…");
  const tree = await runGenerator(plan, currentTree, mode);

  // Step 3: Explain
  onStep?.("💬 Step 3/3 — Writing explanation…");
  const explanation = await runExplainer(plan, tree, message, mode);

  // Convert tree to renderable JSX code string
  const jsxCode = treeToJsx(tree);

  return {
    plan,
    componentTree: tree,
    jsxCode,
    explanation,
  };
}
