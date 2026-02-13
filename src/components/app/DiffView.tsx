/* ────────────────────────────────────────────
   Diff View – Shows line-by-line changes between
   two versions of generated JSX code.
   ──────────────────────────────────────────── */

"use client";

import React from "react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber: { old?: number; new?: number };
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const m = oldLines.length;
  const n = newLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff
  let i = m;
  let j = n;
  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({
        type: "unchanged",
        content: oldLines[i - 1],
        lineNumber: { old: i, new: j },
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: "added",
        content: newLines[j - 1],
        lineNumber: { new: j },
      });
      j--;
    } else {
      stack.push({
        type: "removed",
        content: oldLines[i - 1],
        lineNumber: { old: i },
      });
      i--;
    }
  }

  stack.reverse();
  return stack.length > 0 ? stack : result;
}

interface DiffViewProps {
  oldCode: string;
  newCode: string;
  oldLabel: string;
  newLabel: string;
}

export function DiffView({ oldCode, newCode, oldLabel, newLabel }: DiffViewProps) {
  const lines = computeDiff(oldCode, newCode);

  const added = lines.filter((l) => l.type === "added").length;
  const removed = lines.filter((l) => l.type === "removed").length;

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e]">
      {/* Diff header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#181825]">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400">
            {oldLabel} → {newLabel}
          </span>
          <span className="text-green-400">+{added}</span>
          <span className="text-red-400">-{removed}</span>
        </div>
      </div>

      {/* Diff lines */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={[
              "flex",
              line.type === "added"
                ? "bg-green-900/20"
                : line.type === "removed"
                ? "bg-red-900/20"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Line numbers */}
            <div className="flex-shrink-0 w-16 flex text-gray-600 select-none border-r border-gray-800">
              <span className="w-8 text-right px-1 inline-block">
                {line.lineNumber.old ?? ""}
              </span>
              <span className="w-8 text-right px-1 inline-block">
                {line.lineNumber.new ?? ""}
              </span>
            </div>

            {/* Sign */}
            <div className="flex-shrink-0 w-5 text-center select-none">
              <span
                className={
                  line.type === "added"
                    ? "text-green-400"
                    : line.type === "removed"
                    ? "text-red-400"
                    : "text-gray-600"
                }
              >
                {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
              </span>
            </div>

            {/* Content */}
            <div
              className={[
                "flex-1 px-2 py-0.5 whitespace-pre",
                line.type === "added"
                  ? "text-green-300"
                  : line.type === "removed"
                  ? "text-red-300"
                  : "text-gray-400",
              ].join(" ")}
            >
              {line.content}
            </div>
          </div>
        ))}

        {lines.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No differences
          </div>
        )}
      </div>
    </div>
  );
}
