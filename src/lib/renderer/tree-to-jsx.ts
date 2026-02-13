/* ────────────────────────────────────────────
   Tree → JSX Code Serializer
   Converts ComponentNode tree to readable JSX.
   ──────────────────────────────────────────── */

import { ALLOWED_SET } from "@/components/ui-library/registry";
import type { ComponentNode } from "@/types";

function indent(depth: number): string {
  return "  ".repeat(depth);
}

function serializeProp(key: string, value: unknown): string {
  if (typeof value === "string") return `${key}="${value}"`;
  if (typeof value === "boolean") return value ? key : `${key}={false}`;
  if (typeof value === "number") return `${key}={${value}}`;
  if (Array.isArray(value) || typeof value === "object") {
    return `${key}={${JSON.stringify(value)}}`;
  }
  return `${key}={${JSON.stringify(value)}}`;
}

function nodeToJsx(node: ComponentNode, depth: number): string {
  const pad = indent(depth);
  const tag = ALLOWED_SET.has(node.type) ? node.type : `Unknown_${node.type}`;

  // Build props string
  const propEntries = Object.entries(node.props)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => serializeProp(k, v));

  const propsStr = propEntries.length > 0 ? " " + propEntries.join(" ") : "";

  // No children → self-closing
  if (node.children.length === 0) {
    return `${pad}<${tag}${propsStr} />`;
  }

  // With children
  const childrenJsx = node.children
    .map((child) => {
      if (typeof child === "string") {
        return `${indent(depth + 1)}${child}`;
      }
      return nodeToJsx(child, depth + 1);
    })
    .join("\n");

  return `${pad}<${tag}${propsStr}>\n${childrenJsx}\n${pad}</${tag}>`;
}

/** Convert a ComponentNode tree to readable JSX code */
export function treeToJsx(tree: ComponentNode): string {
  // Collect all unique component types for imports
  const types = new Set<string>();
  function collectTypes(node: ComponentNode) {
    if (ALLOWED_SET.has(node.type)) types.add(node.type);
    for (const child of node.children) {
      if (typeof child !== "string") collectTypes(child);
    }
  }
  collectTypes(tree);

  const importList = Array.from(types).sort().join(", ");
  const imports = `import { ${importList} } from "@/components/ui-library";`;

  const jsx = nodeToJsx(tree, 1);

  return `${imports}

export default function GeneratedUI() {
  return (
${jsx}
  );
}`;
}
