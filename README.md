# Ryze AI — Deterministic UI Generator

An AI-powered agent that converts natural language UI intent into working UI code with a live preview, using a fixed, deterministic component library.

**Think: Claude Code for UI — but safe, reproducible, and debuggable.**

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your OpenAI API key
cp .env.local.example .env.local
# Edit .env.local and set OPENAI_API_KEY=sk-...

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

### Deploy to Vercel

```bash
# Push to GitHub, then:
# 1. Import repo in Vercel
# 2. Add OPENAI_API_KEY environment variable
# 3. Deploy — zero config needed
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Next.js)                  │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Chat     │  │ Live Preview │  │ Code Panel    │  │
│  │ Panel    │  │ (Dynamic     │  │ (Editable JSX)│  │
│  │ +Regen   │  │  Renderer)   │  │ (+ Diff View) │  │
│  └────┬─────┘  └──────────────┘  └───────────────┘  │
│       │        ┌──────────────┐                      │
│       │        │ Explanation  │  Version Timeline     │
│       │        │ Panel        │  (Rollback support)   │
│       │        └──────────────┘                      │
│       │                                              │
│  ┌────▼─────────────────────────────────────────┐    │
│  │            Zustand Store (with versions)      │    │
│  └────┬──────────────────────────────────────────┘    │
└───────┼──────────────────────────────────────────────┘
        │  POST /api/generate (SSE stream)
┌───────▼──────────────────────────────────────────────┐
│                   API Route                          │
│  ┌─────────────────────────────────────────────┐     │
│  │           Agent Pipeline (streamed)          │     │
│  │                                             │     │
│  │  1. PLANNER   → Structured plan (JSON)      │     │
│  │  2. GENERATOR → ComponentNode tree (JSON)   │     │
│  │  3. EXPLAINER → Human-readable explanation  │     │
│  │                                             │     │
│  └───────────────┬─────────────────────────────┘     │
│                  │                                   │
│  ┌───────────────▼─────────────────────────────┐     │
│  │  Safety & Validation                         │     │
│  │  • Component whitelist enforcement           │     │
│  │  • Prompt injection detection (13 patterns)  │     │
│  │  • Tree sanitization + auto-fix              │     │
│  └─────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## Agent Design & Prompts

The system implements a **three-step agent pipeline** — each step has its own isolated prompt template (see `src/lib/agent/prompts.ts`):

### Step 1: Planner
- **Input:** User message + current UI tree (if modifying)
- **Output:** Structured JSON plan with intent, layout, component selection
- **Key behavior:** For modifications, only describes changes (not full rewrites)

### Step 2: Generator
- **Input:** Plan from Step 1 + current tree (if modifying)
- **Output:** ComponentNode JSON tree (validated against whitelist)
- **Key behavior:** Produces a tree that maps 1:1 to the fixed component library

### Step 3: Explainer
- **Input:** Plan + generated tree + user message
- **Output:** Human-readable explanation of decisions
- **Key behavior:** References specific component choices and layout reasoning

**Prompt separation is visible** in `src/lib/agent/prompts.ts` — each step has its own `buildXxxPrompt()` function.

### Streaming Pipeline

The API route uses **Server-Sent Events (SSE)** to stream real-time step progress:
1. `🧠 Step 1/3 — Planning layout & components…`
2. `⚙️ Step 2/3 — Generating component tree…`
3. `💬 Step 3/3 — Writing explanation…`

This gives users immediate feedback instead of waiting in silence.

---

## Component System Design

### Fixed Component Library (15 components)

| Component   | Description                      | Accepts Children |
|-------------|----------------------------------|------------------|
| Button      | Clickable button with variants   | No               |
| Card        | Container with title/subtitle    | Yes              |
| Input       | Text input with label/helper     | No               |
| Table       | Data table with columns/rows     | No               |
| Modal       | Overlay dialog                   | Yes              |
| Sidebar     | Vertical nav panel               | No               |
| Navbar      | Horizontal top nav               | No               |
| Chart       | SVG bar/line/pie chart           | No               |
| Container   | Centered max-width wrapper       | Yes              |
| Stack       | Flex layout (vertical/horizontal)| Yes              |
| Grid        | CSS grid layout                  | Yes              |
| Section     | Semantic section with title      | Yes              |
| Text        | Typography with variants         | No               |
| Badge       | Small status tag                 | No               |
| Divider     | Horizontal separator             | No               |

### Determinism Guarantees
- Components have **fixed implementations** — styles never change
- AI can only: select components, compose layouts, set props, provide content
- **Prohibited:** inline styles, AI-generated CSS, arbitrary Tailwind, new components
- All props validated against schema before rendering
- Component whitelist enforced server-side

### Component Registry
Each component has a full schema (`src/components/ui-library/registry.ts`) including:
- Prop names, types, required flags, allowed enum values
- Descriptions for AI context
- Schema text is injected into every prompt for determinism

---

## Safety & Validation

- **Component Whitelist:** Only 15 allowed component types — validated at tree level
- **Prop Validation:** Required props checked, inline `style`/`className` stripped
- **Prompt Injection Detection:** 13 regex patterns catch common injection attempts
- **Input Sanitization:** Length limits (2000 chars), HTML tag stripping
- **Tree Sanitization:** Invalid nodes removed with warnings, valid subtree returned
- **Error Boundaries:** Render errors caught and displayed gracefully

---

## Features

### Required
- ✅ **Generate UI** from natural language descriptions
- ✅ **Modify existing UI** via chat (incremental edits, not full rewrites)
- ✅ **Regenerate** — re-run the last prompt with a dedicated button
- ✅ **Roll back** to any previous version in the timeline
- ✅ **3-step agent pipeline** (Planner → Generator → Explainer)
- ✅ **Fixed component library** (15 deterministic components)
- ✅ **Prompt separation** visible in code (`buildPlannerPrompt`, `buildGeneratorPrompt`, `buildExplainerPrompt`)
- ✅ **Component whitelist** enforcement (server-side validation)
- ✅ **Prompt injection detection** (13 regex patterns)

### Bonus
- ✅ **SSE streaming** with real-time step progress indicators
- ✅ **Diff view** between consecutive versions (line-by-line)
- ✅ **Responsive viewport switcher** (Desktop / Tablet / Mobile)
- ✅ **Example prompt suggestions** for first-time users
- ✅ **Copy-to-clipboard** for generated code
- ✅ **Mobile responsive** with drawer-based chat
- ✅ **Editable code panel** (modify generated JSX directly)
- ✅ **AI explanation** with expandable plan details

---

## Technical Stack

| Layer     | Choice                |
|-----------|-----------------------|
| Frontend  | Next.js 14 (App Router) |
| Styling   | Tailwind CSS          |
| State     | Zustand               |
| AI        | OpenAI GPT-4o         |
| Streaming | Server-Sent Events (SSE) |
| Language  | TypeScript (strict)   |

---

## Known Limitations

1. **In-memory storage only** — refreshing the browser loses all history
2. **No real interactivity** — buttons don't trigger actions, inputs are read-only in the preview
3. **Chart component** uses mocked/static data only
4. **Single model** — no model selection or fallback chain
5. **Code panel** is a textarea, not a syntax-highlighted Monaco editor

## What I'd Improve With More Time

1. **Monaco editor** for the code panel with proper syntax highlighting and IntelliSense
2. **Persistent storage** — save sessions to localStorage or a database
3. **Component schema validation** with Zod on both client and server
4. **Retry logic** for LLM failures with exponential backoff
5. **Static analysis** of generated code (AST parsing to verify only allowed components)
6. **Replayable generations** — deterministic seed for reproducibility
7. **Error recovery** — if Generator fails, retry with adjusted prompt
8. **Multi-model support** — allow switching between GPT-4o, Claude, etc.
9. **Drag-and-drop** component reordering in the preview
10. **Export to project** — download generated code as a standalone React project

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Inter font
│   ├── page.tsx                # Three-panel layout (Chat | Preview | Code)
│   ├── globals.css             # Tailwind imports + scrollbar styles
│   └── api/generate/
│       └── route.ts            # SSE streaming POST endpoint
├── components/
│   ├── app/                    # Application UI panels
│   │   ├── ChatPanel.tsx       # Chat with regenerate + examples
│   │   ├── CodePanel.tsx       # Editable code + diff toggle
│   │   ├── DiffView.tsx        # Line-by-line version diff
│   │   ├── PreviewPanel.tsx    # Live preview + viewport switcher
│   │   ├── ExplanationPanel.tsx # AI reasoning + plan details
│   │   ├── VersionTimeline.tsx # Version history with rollback
│   │   └── DynamicRenderer.tsx # ComponentNode → React elements
│   └── ui-library/             # Fixed component library (15 components)
│       ├── index.ts            # Barrel export
│       ├── registry.ts         # Schemas fed into AI prompts
│       ├── Button.tsx ... Divider.tsx
├── lib/
│   ├── store.ts                # Zustand store with version history
│   ├── agent/
│   │   ├── pipeline.ts         # 3-step orchestrator with SSE callbacks
│   │   └── prompts.ts          # Separated prompt templates (KEY FILE)
│   ├── renderer/
│   │   └── tree-to-jsx.ts      # Tree → JSX code serializer
│   └── safety/
│       └── validator.ts        # Whitelist + injection detection + sanitization
└── types/
    └── index.ts                # Shared TypeScript definitions
```

---

## License

MIT
