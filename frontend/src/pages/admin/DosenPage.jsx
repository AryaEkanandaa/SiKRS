import { useState, useEffect, useCallback, useMemo } from "react";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import FilterTabs from "../../components/FilterTabs";
import DosenForm from "../../components/Forms/DosenForm";
import { clearCache } from "../../services/api";
import { getDosen, deleteDosen, createDosen, updateDosen } from "../../services/dosenService";

export default function DosenPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const res = await getDosen(); setData(res.data.dosen); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await clearCache(); await fetchData(); } catch (err) { console.error(err); }
    finally { setRefreshing(false); }
  };

  const handleCreate = async (payload) => {
    try { const res = await createDosen(payload); setShowForm(false); setAccountInfo(res.data.account); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal membuat dosen"); }
  };
  const handleUpdate = async (payload) => {
    try { await updateDosen(editItem.id, payload); setShowForm(false); setEditItem(null); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal mengupdate dosen"); }
  };
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteDosen(confirmDelete.id); setConfirmDelete(null); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal menghapus dosen"); }
  };

  const hasBimbingan = data.filter((d) => d._count?.mahasiswas > 0).length;
  const tanpaBimbingan = data.filter((d) => d._count?.mahasiswas === 0).length;

  const filtered = useMemo(() => {
    let result = data;
    if (filter === "ada") result = result.filter((d) => d._count?.mahasiswas > 0);
    else if (filter === "tanpa") result = result.filter((d) => !d._count?.mahasiswas);
    if (!search) return result;
    const q = search.toLowerCase();
    return result.filter((d) => d.nama.toLowerCase().includes(q) || d.nip.toLowerCase().includes(q));
  }, [data, filter, search]);

  const tabs = [
    { value: "semua", label: "Semua", count: data.length },
    { value: "ada", label: "Ada Bimbingan", count: hasBimbingan },
    { value: "tanpa", label: "Tanpa Bimbingan", count: tanpaBimbingan },
  ];

  const columns = [
    {
      key: "nama", label: "Dosen",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">{r.nama.charAt(0).toUpperCase()}</div>
          <div><p className="text-sm font-medium text-slate-700">{r.nama}</p><p className="text-xs text-slate-400 font-mono">{r.nip}</p></div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (r) => <span className="text-sm text-slate-500">{r.email || <span className="text-slate-300">-</span>}</span> },
    {
      key: "bimbingan", label: "Mhs Bimbingan",
      render: (r) => (
        <button onClick={(e) => { e.stopPropagation(); setShowDetail(r); }} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${r._count?.mahasiswas > 0 ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-slate-50 text-slate-400"}`}>
          {r._count?.mahasiswas || 0} mhs
        </button>
      ),
    },
    {
      key: "status", label: "Status",
      render: (r) => r._count?.mahasiswas > 0
        ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-500 text-xs rounded-full font-medium">Ada Bimbingan</span>
        : <span className="px-2 py-0.5 bg-amber-50 text-amber-500 text-xs rounded-full font-medium">Belum Ada Bimbingan</span>,
    },
  ];

  const actions = [
    { label: "Edit", className: "text-blue-600 hover:bg-blue-50", onClick: (row) => { setEditItem(row); setShowForm(true); } },
    { label: "Hapus", className: "text-red-500 hover:bg-red-50", onClick: (row) => setConfirmDelete(row) },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Dosen</h1>
          <p className="text-sm text-slate-400 mt-1">{loading ? "Memuat..." : `${data.length} dosen terdaftar`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50">
            <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? "Memperbarui..." : "Refresh"}
          </button>
          <button onClick={() => { setEditItem(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-medium transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Dosen
        </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari NIP atau Nama..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} search="" onSearchChange={() => {}} actions={actions} pageSize={10} loading={loading} onRowClick={(row) => { setEditItem(row); setShowForm(true); }} />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? "Edit Dosen" : "Tambah Dosen"}>
        <DosenForm initial={editItem} onSubmit={editItem ? handleUpdate : handleCreate} onCancel={() => { setShowForm(false); setEditItem(null); }} />
      </Modal>
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Detail Dosen">
        {showDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">{showDetail.nama.charAt(0).toUpperCase()}</div>
              <div><p className="font-semibold text-slate-800">{showDetail.nama}</p><p className="text-sm text-slate-400 font-mono">{showDetail.nip}</p></div>
            </div>
            <hr className="border-slate-100" />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">NIP</p><p className="text-sm font-medium text-slate-800 mt-1">{showDetail.nip}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Email</p><p className="text-sm text-slate-700 mt-1">{showDetail.email || "-"}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">No. HP</p><p className="text-sm text-slate-700 mt-1">{showDetail.noHp || "-"}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Mhs Bimbingan</p><p className="text-sm font-semibold text-slate-800 mt-1">{showDetail._count?.mahasiswas || 0}</p></div>
            </div>
            <button onClick={() => setShowDetail(null)} className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-medium transition-colors">Tutup</button>
          </div>
        )}
      </Modal>
      <Modal isOpen={!!accountInfo} onClose={() => setAccountInfo(null)} title="Akun Berhasil Dibuat">
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-center gap-2"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Data dosen berhasil disimpan. Akun login telah dibuat otomatis.</div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Email Akun</p><p className="font-mono text-sm bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg select-all">{accountInfo?.email}</p></div>
          <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Password Default</p><p className="font-mono text-sm bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg select-all">{accountInfo?.password}</p></div>
          <button onClick={() => setAccountInfo(null)} className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-medium transition-colors">Tutup</button>
        </div>
      </Modal>
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Konfirmasi Hapus">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Yakin ingin menghapus <strong>{confirmDelete?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Batal</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
