import React from "react";

interface TableColumn {
  key: string;
  header: string;
}

interface TableProps {
  columns: TableColumn[];
  data: Record<string, string | number>[];
  striped?: boolean;
  bordered?: boolean;
}

export function Table({
  columns = [],
  data = [],
  striped = false,
  bordered = false,
}: TableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  "px-4 py-3 font-semibold text-gray-700",
                  bordered ? "border border-gray-200" : "border-b border-gray-200",
                ].join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={[
                striped && idx % 2 === 1 ? "bg-gray-50" : "bg-white",
                "hover:bg-blue-50 transition-colors",
              ].join(" ")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    "px-4 py-3 text-gray-600",
                    bordered ? "border border-gray-200" : "border-b border-gray-100",
                  ].join(" ")}
                >
                  {row[col.key] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
