import { useState, useEffect, useCallback, useMemo } from "react";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import FilterTabs from "../../components/FilterTabs";
import LinkUserForm from "../../components/Forms/LinkUserForm";
import { getUsers, deleteUser, updateUser, linkUser, unlinkUser } from "../../services/userService";
import { clearCache } from "../../services/api";

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [showLink, setShowLink] = useState(false);
  const [linkTarget, setLinkTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const res = await getUsers(); setData(res.data.users); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await clearCache(); await fetchData(); } catch (err) { console.error(err); }
    finally { setRefreshing(false); }
  };

  const filtered = useMemo(() => {
    let result = data;
    if (filter === "mahasiswa") result = result.filter((u) => u.mahasiswa);
    else if (filter === "dosen") result = result.filter((u) => u.dosen);
    else if (filter === "belum") result = result.filter((u) => !u.dosen && !u.mahasiswa);

    if (!search) return result;
    const q = search.toLowerCase();
    return result.filter((u) =>
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.dosen && u.dosen.nama.toLowerCase().includes(q)) ||
      (u.mahasiswa && u.mahasiswa.nama.toLowerCase().includes(q))
    );
  }, [data, filter, search]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteUser(confirmDelete.id); setConfirmDelete(null); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal menghapus user"); }
  };

  const handleLink = async (userId, entityType, entityId) => {
    try { await linkUser(userId, entityType, entityId); setShowLink(false); setLinkTarget(null); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal link user"); }
  };

  const handleUnlink = async (item) => {
    if (!window.confirm(`Lepaskan hubungan user ${item.email}?`)) return;
    try { await unlinkUser(item.id); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal unlink user"); }
  };

  const handleRoleToggle = async (item) => {
    const newRole = item.role === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`Ubah role ${item.email} menjadi ${newRole}?`)) return;
    try { await updateUser(item.id, { role: newRole }); fetchData(); }
    catch (err) { alert(err.response?.data?.message || "Gagal update role"); }
  };

  const tabCounts = useMemo(() => ({
    semua: data.length,
    mahasiswa: data.filter((u) => u.mahasiswa).length,
    dosen: data.filter((u) => u.dosen).length,
    belum: data.filter((u) => !u.dosen && !u.mahasiswa).length,
  }), [data]);

  const tabs = [
    { value: "semua", label: "Semua", count: tabCounts.semua },
    { value: "mahasiswa", label: "Mahasiswa", count: tabCounts.mahasiswa },
    { value: "dosen", label: "Dosen", count: tabCounts.dosen },
    { value: "belum", label: "Belum Tertaut", count: tabCounts.belum },
  ];

  const columns = [
    { key: "email", label: "Email" },
    {
      key: "role", label: "Role", render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.role === "ADMIN" ? "bg-purple-50 text-purple-600" : "bg-slate-100 text-slate-600"}`}>{r.role}</span>
      ),
    },
    {
      key: "linked", label: "Tertaut ke", render: (r) => {
        if (r.dosen) return <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Dosen: {r.dosen.nama}</span>;
        if (r.mahasiswa) return <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Mahasiswa: {r.mahasiswa.nama}</span>;
        return <span className="text-slate-300 italic">Belum tertaut</span>;
      },
    },
  ];

  const actions = [
    { label: "Role", className: "text-purple-600 hover:bg-purple-50", onClick: handleRoleToggle },
    { label: "Link", className: "text-emerald-600 hover:bg-emerald-50", onClick: (row) => { setLinkTarget(row); setShowLink(true); } },
    { label: "Unlink", className: "text-orange-600 hover:bg-orange-50", onClick: handleUnlink },
    { label: "Hapus", className: "text-red-500 hover:bg-red-50", onClick: (row) => setConfirmDelete(row) },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen User</h1>
          <p className="text-sm text-slate-400 mt-1">{loading ? "Memuat..." : `${data.length} akun terdaftar`}</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50">
          <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Memperbarui..." : "Refresh"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <FilterTabs tabs={tabs} active={filter} onChange={(v) => { setFilter(v); setSearch(""); }} />
        <div className="relative w-full sm:w-64">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari email, role, atau nama..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} search="" onSearchChange={() => {}} actions={actions} pageSize={15} loading={loading} />

      <Modal isOpen={showLink} onClose={() => { setShowLink(false); setLinkTarget(null); }} title="Link User ke Data">
        <LinkUserForm user={linkTarget} onSubmit={handleLink} onCancel={() => { setShowLink(false); setLinkTarget(null); }} />
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Konfirmasi Hapus">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Yakin ingin menghapus user <strong>{confirmDelete?.email}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Batal</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
