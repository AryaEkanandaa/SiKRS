import { useState, useMemo } from "react";

function SkeletonRows({ cols }) {
  return [...Array(5)].map((_, i) => (
    <tr key={i} className="animate-pulse">
      {[...Array(cols)].map((__, j) => (
        <td key={j} className="px-4 py-4"><div className="h-4 bg-slate-100 rounded w-3/4" /></td>
      ))}
    </tr>
  ));
}

export default function DataTable({
  columns,
  data,
  search,
  onSearchChange,
  searchPlaceholder = "Cari...",
  actions,
  pageSize = 10,
  loading,
  onRowClick,
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const start = (page - 1) * pageSize;
  const paged = useMemo(() => data.slice(start, start + pageSize), [data, start, pageSize]);
  const colSpan = columns.length + (actions ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Search & Pagination Top */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
        <div className="relative w-full sm:w-80">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { onSearchChange(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
          {search && (
            <button onClick={() => onSearchChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 text-sm">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">&larr;</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-300 text-xs">...</span>}
                  <button onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? "bg-blue-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>{p}</button>
                </span>
              ))}
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">&rarr;</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{col.label}</th>
              ))}
              {actions && <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <SkeletonRows cols={colSpan} />
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm font-medium text-slate-500">{search ? "Tidak ada data yang cocok" : "Belum ada data"}</p>
                  {search && <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain</p>}
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={row.id} onClick={() => onRowClick?.(row)} className={`hover:bg-blue-50/40 transition-colors duration-150 ${onRowClick ? "cursor-pointer" : ""}`}>
                  {columns.map((col, i) => (
                    <td key={i} className="px-4 py-3.5 text-sm text-slate-700">
                      {col.render ? col.render(row, idx) : row[col.key] ?? <span className="text-slate-300">-</span>}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-sm text-right whitespace-nowrap space-x-1.5">
                      {actions.map((act, i) => (
                        <button key={i} onClick={(e) => { e.stopPropagation(); act.onClick(row); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${act.className || "text-blue-600 hover:bg-blue-50"}`}>
                          {act.label}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && data.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400">{data.length} data</p>
          {totalPages > 1 && (
            <p className="text-xs text-slate-400">
              Halaman {page} dari {totalPages}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
