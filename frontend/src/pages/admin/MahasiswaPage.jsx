import { useState, useEffect, useCallback, useMemo } from "react";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import FilterTabs from "../../components/FilterTabs";
import MahasiswaForm from "../../components/Forms/MahasiswaForm";
import AssignPaForm from "../../components/Forms/AssignPaForm";
import { getMahasiswa, deleteMahasiswa, createMahasiswa, updateMahasiswa, assignPa } from "../../services/mahasiswaService";
import { getDosen } from "../../services/dosenService";
import { getProgramStudi } from "../../services/programStudiService";
import { clearCache } from "../../services/api";

export default function MahasiswaPage() {
  const [data, setData] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, dRes, pRes] = await Promise.all([getMahasiswa(search), getDosen(), getProgramStudi()]);
      setData(mRes.data.mahasiswa);
      setDosenList(dRes.data.dosen);
      setProdiList(pRes.data.programStudi);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await clearCache(); await fetchData(); } catch (err) { console.error(err); }
    finally { setRefreshing(false); }
  };

  const handleCreate = async (payload) => {
    try { const res = await createMahasiswa(payload); setShowForm(false); setAccountInfo(res.data.account); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal membuat mahasiswa"); }
  };
  const handleUpdate = async (payload) => {
    try { await updateMahasiswa(editItem.id, payload); setShowForm(false); setEditItem(null); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal mengupdate mahasiswa"); }
  };
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteMahasiswa(confirmDelete.id); setConfirmDelete(null); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal menghapus mahasiswa"); }
  };
  const handleAssign = async (id, dosenPAId) => {
    try { await assignPa(id, dosenPAId); setShowAssign(false); setAssignTarget(null); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal assign dosen PA"); }
  };

  const withPa = data.filter((m) => m.dosenPA).length;
  const withoutPa = data.length - withPa;

  const filtered = useMemo(() => {
    let result = data;
    if (filter === "withPa") result = result.filter((m) => m.dosenPA);
    else if (filter === "withoutPa") result = result.filter((m) => !m.dosenPA);
    if (!search) return result;
    const q = search.toLowerCase();
    return result.filter((m) => m.nama.toLowerCase().includes(q) || m.nim.toLowerCase().includes(q) || m.prodi?.nama?.toLowerCase().includes(q));
  }, [data, filter, search]);

  const tabs = [
    { value: "semua", label: "Semua", count: data.length },
    { value: "withPa", label: "Sudah Punya PA", count: withPa },
    { value: "withoutPa", label: "Belum Punya PA", count: withoutPa },
  ];

  const columns = [
    {
      key: "nama", label: "Mahasiswa",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">{r.nama.charAt(0).toUpperCase()}</div>
          <div><p className="text-sm font-medium text-slate-700">{r.nama}</p><p className="text-xs text-slate-400 font-mono">{r.nim}</p></div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (r) => <span className="text-sm text-slate-500">{r.email || <span className="text-slate-300">-</span>}</span> },
    { key: "prodi", label: "Prodi", render: (r) => r.prodi?.nama ? <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">{r.prodi.nama}</span> : <span className="text-slate-300">-</span> },
    {
      key: "dosenPA", label: "Dosen PA",
      render: (r) => r.dosenPA ? <span className="text-sm text-slate-600">{r.dosenPA.nama}</span> : <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-xs rounded-full font-medium">Belum ada</span>,
    },
    {
      key: "paBadge", label: "Status",
      render: (r) => r.dosenPA
        ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-500 text-xs rounded-full font-medium">Sudah Ada PA</span>
        : <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-xs rounded-full font-medium">Belum Ada PA</span>,
    },
  ];

  const actions = [
    { label: "Edit", className: "text-blue-600 hover:bg-blue-50", onClick: (row) => { setEditItem(row); setShowForm(true); } },
    { label: "Assign PA", className: "text-emerald-600 hover:bg-emerald-50", onClick: (row) => { setAssignTarget(row); setShowAssign(true); } },
    { label: "Hapus", className: "text-red-500 hover:bg-red-50", onClick: (row) => setConfirmDelete(row) },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Mahasiswa</h1>
          <p className="text-sm text-slate-400 mt-1">{loading ? "Memuat..." : `${data.length} mahasiswa terdaftar`}</p>
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
          Tambah Mahasiswa
        </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari NIM, Nama, atau Prodi..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} search="" onSearchChange={() => {}} actions={actions} pageSize={10} loading={loading} onRowClick={(row) => { setEditItem(row); setShowForm(true); }} />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? "Edit Mahasiswa" : "Tambah Mahasiswa"}>
        <MahasiswaForm initial={editItem} dosenList={dosenList} prodiList={prodiList} onSubmit={editItem ? handleUpdate : handleCreate} onCancel={() => { setShowForm(false); setEditItem(null); }} />
      </Modal>
      <Modal isOpen={showAssign} onClose={() => { setShowAssign(false); setAssignTarget(null); }} title="Assign Dosen PA">
        <AssignPaForm mahasiswa={assignTarget} dosenList={dosenList} data={data} onSubmit={handleAssign} onCancel={() => { setShowAssign(false); setAssignTarget(null); }} />
      </Modal>
      <Modal isOpen={!!accountInfo} onClose={() => setAccountInfo(null)} title="Akun Berhasil Dibuat">
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Data mahasiswa berhasil disimpan. Akun login telah dibuat otomatis.
          </div>
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
