import { useState, useEffect, useMemo, useCallback } from "react";
import { getDosen } from "../../services/dosenService";
import Modal from "../../components/Modal";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(4)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function DosenDetailModal({ dosen, onClose }) {
  if (!dosen) return null;
  return (
    <Modal isOpen={!!dosen} onClose={onClose} title="Detail Dosen">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-sm">
            {dosen.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{dosen.nama}</p>
            <p className="text-sm text-slate-400 font-mono">{dosen.nip}</p>
          </div>
        </div>
        <hr className="border-slate-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">NIP</p>
            <p className="text-sm font-medium text-slate-800 mt-1">{dosen.nip}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Nama</p>
            <p className="text-sm font-medium text-slate-800 mt-1">{dosen.nama}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Email</p>
            <p className="text-sm text-slate-700 mt-1">{dosen.email || "-"}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">No. HP</p>
            <p className="text-sm text-slate-700 mt-1">{dosen.noHp || "-"}</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
            {dosen._count?.mahasiswas || 0}
          </div>
          <div>
            <p className="text-xs text-slate-500">Mahasiswa Bimbingan</p>
            <p className="text-sm font-semibold text-slate-800">{dosen._count?.mahasiswas || 0} mahasiswa</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
          Tutup
        </button>
      </div>
    </Modal>
  );
}

export default function DosenListPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const pageSize = 8;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const res = await getDosen(); setData(res.data.dosen); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((d) => d.nama.toLowerCase().includes(q) || d.nip.toLowerCase().includes(q));
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daftar Dosen</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari NIP atau Nama dosen..."
          className="w-full sm:w-96 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">NIP</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">No. HP</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Bimbingan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-sm font-medium text-slate-500">{search ? "Tidak ada dosen yang cocok" : "Belum ada data dosen"}</p>
                    {search && <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain</p>}
                  </td>
                </tr>
              ) : (
                paged.map((dosen, idx) => (
                  <tr
                    key={dosen.id}
                    onClick={() => setSelectedDosen(dosen)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-4 py-4 text-sm text-slate-400 w-10">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                          {dosen.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{dosen.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 font-mono hidden sm:table-cell">{dosen.nip}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 hidden md:table-cell">{dosen.email || <span className="text-slate-300">-</span>}</td>
                    <td className="px-4 py-4 text-sm text-slate-500 hidden lg:table-cell">{dosen.noHp || <span className="text-slate-300">-</span>}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-medium ${
                        dosen._count?.mahasiswas > 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-50 text-slate-400"
                      }`}>
                        {dosen._count?.mahasiswas || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              Menampilkan {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} dari {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-white hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                &larr;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-slate-300 text-xs">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white hover:border-slate-300 border border-transparent"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-white hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DosenDetailModal dosen={selectedDosen} onClose={() => setSelectedDosen(null)} />
    </div>
  );
}
