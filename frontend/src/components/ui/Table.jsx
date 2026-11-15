import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';

/**
 * Design System: Semantic, Accessible Data Table
 * Conforms to WCAG AA, semantic table hierarchy, aria-sort, pagination, and zero-mock empty state.
 */
export function Table({
  columns = [],
  data = [],
  keyField = 'id',
  sortColumn = null,
  sortDirection = 'asc',
  onSort = null,
  loading = false,
  emptyTitle = 'No records available',
  emptyDescription = 'There are no records found in the database.',
  emptyAction = null,
  emptyIcon = null,
  pagination = null, // { page, pageSize, total, onPageChange, onPageSizeChange }
  className = '',
  id,
}) {
  return (
    <div id={id} className={`w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden ${className}`}>
      {/* Scrollable Table Viewport */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              {columns.map((col) => {
                const isSortable = Boolean(col.sortable && onSort);
                const isSorted = sortColumn === col.key;
                const ariaSort = isSorted
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : isSortable
                  ? 'none'
                  : undefined;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`px-4 py-3.5 whitespace-nowrap select-none ${col.className || ''}`}
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="flex items-center gap-1.5 hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded px-1 -mx-1"
                      >
                        <span>{col.label}</span>
                        <span className="text-slate-500 flex items-center">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                            )
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 opacity-30" />
                          )}
                        </span>
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-slate-300">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`cell-${idx}-${cIdx}`} className="px-4 py-4">
                      <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rIdx) => (
                <tr
                  key={row[keyField] || `row-${rIdx}`}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-xs md:text-sm ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, rIdx) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Table Pagination Footer */}
      {pagination && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pagination.pageSize || 10}
              onChange={(e) =>
                pagination.onPageSizeChange && pagination.onPageSizeChange(Number(e.target.value))
              }
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-slate-500 font-mono ml-2">
              Showing{' '}
              {pagination.total === 0
                ? '0'
                : `${(pagination.page - 1) * pagination.pageSize + 1} - ${Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.total
                  )}`}{' '}
              of {pagination.total} records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange && pagination.onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-300">
              Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
            </span>
            <button
              type="button"
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onPageChange && pagination.onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
