import { useState, useEffect, useCallback } from "react";
import DataTable from "../../components/DataTable";
import { getMyMahasiswaBimbingan } from "../../services/dosenService";

export default function BimbinganPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const res = await getMyMahasiswaBimbingan(); setData(res.data.mahasiswa); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter((m) =>
    !search || m.nama.toLowerCase().includes(search.toLowerCase()) || m.nim.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "nim", label: "NIM" },
    { key: "nama", label: "Nama" },
    { key: "email", label: "Email" },
    { key: "noHp", label: "No. HP" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mahasiswa Bimbingan</h1>
        <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full">{data.length} mahasiswa</span>
      </div>
      {loading ? (
        <div className="text-center py-10 text-slate-500">Memuat data...</div>
      ) : (
        <DataTable columns={columns} data={filtered} search={search} onSearchChange={setSearch} searchPlaceholder="Cari NIM atau Nama..." pageSize={10} />
      )}
    </div>
  );
}
