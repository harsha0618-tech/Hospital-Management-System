function DataTable({ columns, rows, roleColor = "admin", renderRow }) {
  return (
    <div className="overflow-x-auto rounded-card shadow-soft border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className={`bg-${roleColor}-light text-${roleColor}-dark`}>
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-semibold whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-gray-400"
              >
                No patients added yet
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => renderRow(row, idx))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;