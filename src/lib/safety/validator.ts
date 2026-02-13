/* ────────────────────────────────────────────
   Safety – Component Whitelist Validator
   Validates the AI-generated ComponentNode tree.
   ──────────────────────────────────────────── */

import { ALLOWED_SET, getComponentSchema } from "@/components/ui-library/registry";
import type { ComponentNode } from "@/types";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: ComponentNode;
}

/** Validate a full component tree against the whitelist */
export function validateTree(node: ComponentNode): ValidationResult {
  const errors: string[] = [];

  function walk(n: ComponentNode, path: string): ComponentNode | null {
    // 1. Check component is in the whitelist
    if (!ALLOWED_SET.has(n.type)) {
      errors.push(`[${path}] Unknown component "${n.type}" — not in whitelist`);
      return null;
    }

    // 2. Check schema exists
    const schema = getComponentSchema(n.type);
    if (!schema) {
      errors.push(`[${path}] No schema found for "${n.type}"`);
      return null;
    }

    // 3. Validate required props
    for (const prop of schema.props) {
      if (prop.required && !(prop.name in n.props)) {
        errors.push(`[${path}] Missing required prop "${prop.name}" on "${n.type}"`);
      }
    }

    // 4. Check for inline styles (forbidden)
    if ("style" in n.props) {
      errors.push(`[${path}] Inline styles are forbidden on "${n.type}"`);
      const cleaned = { ...n.props };
      delete cleaned.style;
      n = { ...n, props: cleaned };
    }

    // 5. Check for className (forbidden — AI must not add Tailwind)
    if ("className" in n.props) {
      errors.push(`[${path}] Custom className is forbidden on "${n.type}"`);
      const cleaned = { ...n.props };
      delete cleaned.className;
      n = { ...n, props: cleaned };
    }

    // 6. Recursively validate children
    const validChildren: (ComponentNode | string)[] = [];
    for (let i = 0; i < n.children.length; i++) {
      const child = n.children[i];
      if (typeof child === "string") {
        validChildren.push(child);
      } else {
        const result = walk(child, `${path}.children[${i}]`);
        if (result) validChildren.push(result);
      }
    }

    return { ...n, children: validChildren };
  }

  // Ensure node has an id
  if (!node.id) {
    errors.push("[root] Missing id");
    node = { ...node, id: "root" };
  }

  const sanitized = walk(node, "root");

  return {
    valid: errors.length === 0,
    errors,
    sanitized: sanitized || undefined,
  };
}

/** Check if a string looks like it could be a prompt injection */
export function detectPromptInjection(input: string): boolean {
  const suspicious = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /you\s+are\s+now/i,
    /system\s*:\s*/i,
    /\<\|im_start\|\>/i,
    /\<\|im_end\|\>/i,
    /forget\s+(everything|all|your)/i,
    /override\s+(your|the|all)/i,
    /new\s+instructions?\s*:/i,
    /disregard\s+(all|previous|the)/i,
    /\bACT\s+AS\b/i,
    /\bPRETEND\b/i,
    /\bJAILBREAK\b/i,
    /\bDAN\b/i,
  ];

  return suspicious.some((re) => re.test(input));
}

/** Sanitize user input */
export function sanitizeInput(input: string): string {
  // Trim whitespace and limit length
  let sanitized = input.trim().slice(0, 2000);

  // Remove potential HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  return sanitized;
}
