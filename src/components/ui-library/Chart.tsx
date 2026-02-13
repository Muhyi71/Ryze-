import React from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  type: "bar" | "line" | "pie";
  data: DataPoint[];
  title?: string;
  height?: number;
}

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
];

export function Chart({ type = "bar", data = [], title, height = 220 }: ChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>}

      {type === "bar" && (
        <div className="flex items-end gap-2" style={{ height }}>
          {data.map((item, i) => {
            const pct = (item.value / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{item.value}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                    minHeight: 4,
                  }}
                />
                <span className="text-xs text-gray-500 truncate max-w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {type === "line" && (
        <svg
          viewBox={`0 0 ${data.length * 60} ${height}`}
          className="w-full"
          style={{ height }}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="0"
              x2={data.length * 60}
              y1={height - f * (height - 40)}
              y2={height - f * (height - 40)}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
          ))}
          {/* Line + dots */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinejoin="round"
            points={data
              .map(
                (d, i) =>
                  `${i * 60 + 30},${height - 30 - (d.value / maxVal) * (height - 50)}`
              )
              .join(" ")}
          />
          {data.map((d, i) => {
            const x = i * 60 + 30;
            const y = height - 30 - (d.value / maxVal) * (height - 50);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#3b82f6" />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#6b7280"
                  fontSize="11"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {type === "pie" && (
        <svg viewBox="0 0 200 200" className="w-full" style={{ height }}>
          {(() => {
            const total = data.reduce((s, d) => s + d.value, 0) || 1;
            let cumAngle = 0;
            return data.map((d, i) => {
              const angle = (d.value / total) * 360;
              const startAngle = cumAngle;
              cumAngle += angle;
              const r = 80;
              const cx = 100,
                cy = 100;
              const startRad = ((startAngle - 90) * Math.PI) / 180;
              const endRad = ((startAngle + angle - 90) * Math.PI) / 180;
              const x1 = cx + r * Math.cos(startRad);
              const y1 = cy + r * Math.sin(startRad);
              const x2 = cx + r * Math.cos(endRad);
              const y2 = cy + r * Math.sin(endRad);
              const large = angle > 180 ? 1 : 0;
              const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
              return (
                <path
                  key={i}
                  d={path}
                  fill={COLORS[i % COLORS.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            });
          })()}
        </svg>
      )}

      {/* Legend for pie */}
      {type === "pie" && (
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
