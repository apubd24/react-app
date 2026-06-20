import React from 'react';

const DevicePagination = ({
  currentPage,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalPages,
  filteredDevicesLength,
  indexOfFirstRow,
  indexOfLastRow,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4">
        {/* INFO */}
        <div className="text-xs text-slate-500">
          Showing {indexOfFirstRow + 1} -{' '}
          {Math.min(indexOfLastRow, filteredDevicesLength)} of{' '}
          {filteredDevicesLength}
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          {/* ROWS */}
          <select
            value={rowsPerPage}
            onChange={(e) =>
              onRowsPerPageChange(Number(e.target.value))
            }
            className="px-2 py-1 text-xs border rounded-lg bg-slate-50"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}/page
              </option>
            ))}
          </select>

          {/* PREV */}
          <button
            onClick={() =>
              onPageChange(Math.max(currentPage - 1, 1))
            }
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs border rounded-lg disabled:opacity-50"
          >
            Prev
          </button>

          {/* PAGE NUMBERS */}
          {[...Array(totalPages)]
            .slice(0, 5)
            .map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-2 py-1 text-xs rounded-lg border ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}

          {/* NEXT */}
          <button
            onClick={() =>
              onPageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevicePagination;