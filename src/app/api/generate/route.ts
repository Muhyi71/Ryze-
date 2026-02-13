/* ────────────────────────────────────────────
   API Route – POST /api/generate
   Runs the full agent pipeline with SSE streaming.
   ──────────────────────────────────────────── */

import { NextRequest } from "next/server";
import { runAgentPipelineStreaming } from "@/lib/agent/pipeline";
import { detectPromptInjection, sanitizeInput } from "@/lib/safety/validator";
import type { GenerateRequest } from "@/types";

// Allow up to 60s for the 3-step AI pipeline on Vercel
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const { message, currentTree, mode } = body;

    // ── Input validation ───────────────────
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Prompt injection check ─────────────
    if (detectPromptInjection(message)) {
      return new Response(
        JSON.stringify({ success: false, error: "Your input was flagged as potentially unsafe. Please rephrase your request." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Sanitize ───────────────────────────
    const cleanMessage = sanitizeInput(message);

    // ── API Key check ──────────────────────
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Run the agent pipeline with SSE streaming ──
    console.log(`[API] Running pipeline — mode: ${mode}, message: "${cleanMessage.slice(0, 80)}..."`);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        function sendEvent(data: Record<string, unknown>) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }

        try {
          const result = await runAgentPipelineStreaming(
            cleanMessage,
            currentTree,
            mode,
            (stepName: string) => sendEvent({ type: "step", step: stepName })
          );

          sendEvent({ type: "result", data: result });
          sendEvent({ type: "done" });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err: unknown) {
          console.error("[API] Pipeline error:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          sendEvent({ type: "error", message: `Generation failed: ${errorMessage}` });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("[API] Request error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: `Generation failed: ${errorMessage}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
