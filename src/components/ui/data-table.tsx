type DataTableProps = {
  columns: string[];
  rows: string[][];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[var(--border-subtle)]">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[var(--bg-surface-alt)]/70">
          <tr>
            {columns.map((column, columnIndex) => (
              <th
                key={`${column}-${columnIndex}`}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row[0]}-${rowIndex}`} className="border-t border-[var(--border-subtle)]">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}-${cell}`}
                  className="px-4 py-3 text-sm text-[var(--text-primary)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
