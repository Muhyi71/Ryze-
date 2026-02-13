/* ────────────────────────────────────────────
   Component Registry – Schema definitions the
   AI agent uses to understand each component.
   ──────────────────────────────────────────── */

import { ComponentSchema } from "@/types";

/** Whitelist of allowed component type names */
export const ALLOWED_COMPONENTS = [
  "Button",
  "Card",
  "Input",
  "Table",
  "Modal",
  "Sidebar",
  "Navbar",
  "Chart",
  "Container",
  "Stack",
  "Grid",
  "Section",
  "Text",
  "Badge",
  "Divider",
] as const;

export type AllowedComponent = (typeof ALLOWED_COMPONENTS)[number];

/** Full schema catalog – fed into every AI prompt for determinism */
export const COMPONENT_SCHEMAS: ComponentSchema[] = [
  {
    name: "Button",
    description: "A clickable button with variants and sizes.",
    acceptsChildren: false,
    props: [
      { name: "label", type: "string", required: true, description: "Button text" },
      { name: "variant", type: "enum", options: ["primary", "secondary", "danger", "ghost"], description: "Visual style" },
      { name: "size", type: "enum", options: ["sm", "md", "lg"], description: "Button size" },
      { name: "disabled", type: "boolean", description: "Disabled state" },
      { name: "fullWidth", type: "boolean", description: "Stretch to fill container" },
    ],
  },
  {
    name: "Card",
    description: "A container card with optional title and subtitle.",
    acceptsChildren: true,
    props: [
      { name: "title", type: "string", description: "Card heading" },
      { name: "subtitle", type: "string", description: "Card subheading" },
      { name: "padding", type: "enum", options: ["sm", "md", "lg"], description: "Inner padding" },
      { name: "bordered", type: "boolean", description: "Show border" },
      { name: "hoverable", type: "boolean", description: "Scale on hover" },
    ],
  },
  {
    name: "Input",
    description: "A text input field with label and helper text.",
    acceptsChildren: false,
    props: [
      { name: "label", type: "string", description: "Field label" },
      { name: "placeholder", type: "string", description: "Placeholder text" },
      { name: "type", type: "enum", options: ["text", "email", "password", "number", "search"], description: "Input type" },
      { name: "disabled", type: "boolean", description: "Disabled state" },
      { name: "helperText", type: "string", description: "Helper text below input" },
      { name: "error", type: "boolean", description: "Error state" },
    ],
  },
  {
    name: "Table",
    description: "A data table with columns and rows.",
    acceptsChildren: false,
    props: [
      { name: "columns", type: "array", required: true, description: "Column definitions: {key:string, header:string}[]" },
      { name: "data", type: "array", required: true, description: "Row data: Record<string, string|number>[]" },
      { name: "striped", type: "boolean", description: "Alternating row colors" },
      { name: "bordered", type: "boolean", description: "Show cell borders" },
    ],
  },
  {
    name: "Modal",
    description: "An overlay modal dialog. Renders children inside.",
    acceptsChildren: true,
    props: [
      { name: "title", type: "string", required: true, description: "Modal heading" },
      { name: "open", type: "boolean", required: true, description: "Visibility flag" },
      { name: "size", type: "enum", options: ["sm", "md", "lg"], description: "Width preset" },
    ],
  },
  {
    name: "Sidebar",
    description: "A vertical sidebar navigation panel.",
    acceptsChildren: false,
    props: [
      { name: "title", type: "string", description: "Sidebar heading" },
      { name: "items", type: "array", required: true, description: "Nav items: {label:string, icon?:string, active?:boolean}[]" },
      { name: "collapsed", type: "boolean", description: "Collapsed to icons only" },
    ],
  },
  {
    name: "Navbar",
    description: "A horizontal top navigation bar.",
    acceptsChildren: false,
    props: [
      { name: "title", type: "string", required: true, description: "Brand / page title" },
      { name: "items", type: "array", description: "Nav links: {label:string, active?:boolean}[]" },
      { name: "sticky", type: "boolean", description: "Stick to top on scroll" },
    ],
  },
  {
    name: "Chart",
    description: "A simple chart with mocked data. SVG-based.",
    acceptsChildren: false,
    props: [
      { name: "type", type: "enum", options: ["bar", "line", "pie"], required: true, description: "Chart type" },
      { name: "data", type: "array", required: true, description: "Data points: {label:string, value:number}[]" },
      { name: "title", type: "string", description: "Chart title" },
      { name: "height", type: "number", description: "Chart height in pixels" },
    ],
  },
  {
    name: "Container",
    description: "A centered content container with max-width.",
    acceptsChildren: true,
    props: [
      { name: "maxWidth", type: "enum", options: ["sm", "md", "lg", "xl", "full"], description: "Max width preset" },
      { name: "padding", type: "enum", options: ["none", "sm", "md", "lg"], description: "Padding" },
      { name: "centered", type: "boolean", description: "Center content horizontally" },
    ],
  },
  {
    name: "Stack",
    description: "A flex container that stacks children vertically or horizontally.",
    acceptsChildren: true,
    props: [
      { name: "direction", type: "enum", options: ["vertical", "horizontal"], description: "Stack direction" },
      { name: "gap", type: "enum", options: ["none", "xs", "sm", "md", "lg", "xl"], description: "Gap between children" },
      { name: "align", type: "enum", options: ["start", "center", "end", "stretch"], description: "Cross-axis alignment" },
      { name: "justify", type: "enum", options: ["start", "center", "end", "between", "around"], description: "Main-axis alignment" },
      { name: "wrap", type: "boolean", description: "Allow wrapping" },
    ],
  },
  {
    name: "Grid",
    description: "A CSS grid layout container.",
    acceptsChildren: true,
    props: [
      { name: "columns", type: "enum", options: ["1", "2", "3", "4", "6", "12"], description: "Number of columns" },
      { name: "gap", type: "enum", options: ["none", "sm", "md", "lg"], description: "Gap between cells" },
    ],
  },
  {
    name: "Section",
    description: "A semantic section wrapper with optional title.",
    acceptsChildren: true,
    props: [
      { name: "title", type: "string", description: "Section heading" },
      { name: "description", type: "string", description: "Section subtext" },
      { name: "padding", type: "enum", options: ["none", "sm", "md", "lg"], description: "Padding" },
    ],
  },
  {
    name: "Text",
    description: "A text element with typographic variants.",
    acceptsChildren: false,
    props: [
      { name: "content", type: "string", required: true, description: "Text content" },
      { name: "variant", type: "enum", options: ["h1", "h2", "h3", "h4", "body", "caption", "label"], description: "Typography variant" },
      { name: "weight", type: "enum", options: ["normal", "medium", "semibold", "bold"], description: "Font weight" },
      { name: "color", type: "enum", options: ["default", "muted", "primary", "danger", "success"], description: "Text color" },
      { name: "align", type: "enum", options: ["left", "center", "right"], description: "Text alignment" },
    ],
  },
  {
    name: "Badge",
    description: "A small status badge / tag.",
    acceptsChildren: false,
    props: [
      { name: "label", type: "string", required: true, description: "Badge text" },
      { name: "variant", type: "enum", options: ["default", "primary", "success", "warning", "danger"], description: "Color variant" },
      { name: "size", type: "enum", options: ["sm", "md"], description: "Badge size" },
    ],
  },
  {
    name: "Divider",
    description: "A horizontal divider line.",
    acceptsChildren: false,
    props: [
      { name: "spacing", type: "enum", options: ["sm", "md", "lg"], description: "Vertical spacing around divider" },
    ],
  },
];

/** Quick lookup set for validation */
export const ALLOWED_SET = new Set<string>(ALLOWED_COMPONENTS);

/** Get schema for a component by name */
export function getComponentSchema(name: string): ComponentSchema | undefined {
  return COMPONENT_SCHEMAS.find((s) => s.name === name);
}

/** Format the schemas as text for AI prompts */
export function schemasToPromptText(): string {
  return COMPONENT_SCHEMAS.map((schema) => {
    const props = schema.props
      .map((p) => {
        let def = `  - ${p.name}: ${p.type}`;
        if (p.options) def += ` (${p.options.join(" | ")})`;
        if (p.required) def += " [REQUIRED]";
        def += ` — ${p.description}`;
        return def;
      })
      .join("\n");
    return `${schema.name}${schema.acceptsChildren ? " (accepts children)" : ""}\n  ${schema.description}\n  Props:\n${props}`;
  }).join("\n\n");
}
