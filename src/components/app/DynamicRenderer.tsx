/* ────────────────────────────────────────────
   Dynamic Renderer – Renders ComponentNode
   trees using the fixed component library.
   ──────────────────────────────────────────── */

"use client";

import React from "react";
import * as UILib from "@/components/ui-library";
import type { ComponentNode } from "@/types";

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  Button: UILib.Button,
  Card: UILib.Card,
  Input: UILib.Input,
  Table: UILib.Table,
  Modal: UILib.Modal,
  Sidebar: UILib.Sidebar,
  Navbar: UILib.Navbar,
  Chart: UILib.Chart,
  Container: UILib.Container,
  Stack: UILib.Stack,
  Grid: UILib.Grid,
  Section: UILib.Section,
  Text: UILib.Text,
  Badge: UILib.Badge,
  Divider: UILib.Divider,
};

function renderNode(node: ComponentNode | string): React.ReactNode {
  if (typeof node === "string") {
    return node;
  }

  const Component = COMPONENT_MAP[node.type];
  if (!Component) {
    return (
      <div key={node.id} className="border border-red-300 bg-red-50 p-2 rounded text-xs text-red-600">
        Unknown component: {node.type}
      </div>
    );
  }

  const children = node.children.length > 0
    ? node.children.map((child, i) => (
        <React.Fragment key={typeof child === "string" ? `text-${i}` : child.id || i}>
          {renderNode(child)}
        </React.Fragment>
      ))
    : undefined;

  return (
    <Component key={node.id} {...node.props}>
      {children}
    </Component>
  );
}

interface DynamicRendererProps {
  tree: ComponentNode | null;
}

export function DynamicRenderer({ tree }: DynamicRendererProps) {
  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">✨</div>
          <p className="font-medium">No UI generated yet</p>
          <p className="text-xs mt-1">Describe a UI in the chat to get started</p>
        </div>
      </div>
    );
  }

  try {
    return <div className="p-4">{renderNode(tree)}</div>;
  } catch (err) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm p-4">
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-medium">Render Error</p>
          <p className="text-xs mt-1">
            {err instanceof Error ? err.message : "Failed to render the UI tree"}
          </p>
        </div>
      </div>
    );
  }
}
