import React from "react";

type SortDirection = "asc" | "desc";

export type TableColumn<T> = {
  label: string;
  accessor: keyof T | string | ((row: T) => any);
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  sortState: { column: string; direction: SortDirection };
  onSort: (column: string) => void;
  onRowClick?: (row: T) => void;
};

export default function Table<T extends object>({
  columns,
  data,
  sortState,
  onSort,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg shadow">
      <table className="w-full bg-[var(--background)] text-[var(--text-color-light)]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.label}
                className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                onClick={() =>
                  col.sortable &&
                  onSort(
                    typeof col.accessor === "function"
                      ? col.label
                      : col.accessor.toString()
                  )
                }
              >
                {col.label}
                {col.sortable && sortState.column === col.accessor && (
                  <span className="ml-1">
                    {sortState.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`${
                i % 2 === 0
                  ? "bg-[var(--table-dark)]"
                  : "bg-[var(--table-light)]"
              } ${
                onRowClick
                  ? "cursor-pointer hover:bg-[var(--accent)] hover:bg-opacity-20"
                  : ""
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.label}
                  className={`px-4 py-2 text-center ${
                    col.label === "Name"
                      ? "font-bold"
                      : col.label === "Abilities"
                      ? "italic"
                      : "font-normal"
                  }`}
                >
                  {col.render ? col.render(row) : (row as any)[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
