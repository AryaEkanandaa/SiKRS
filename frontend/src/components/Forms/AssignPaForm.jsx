import { useState, useMemo } from "react";

export default function AssignPaForm({ mahasiswa, dosenList, data, onSubmit, onCancel }) {
  const [dosenPAId, setDosenPAId] = useState(mahasiswa?.dosenPAId || "");
  const [dosenSearch, setDosenSearch] = useState("");

  const filteredDosen = useMemo(() => {
    if (!dosenSearch) return dosenList;
    return dosenList.filter((d) =>
      d.nama.toLowerCase().includes(dosenSearch.toLowerCase()) ||
      d.nip.toLowerCase().includes(dosenSearch.toLowerCase())
    );
  }, [dosenList, dosenSearch]);

  const selectedDosen = dosenList.find((d) => d.id === dosenPAId);

  if (!data) {
    data = [];
  }
  const tanpaPa = data.filter((m) => !m.dosenPA && m.id !== mahasiswa?.id);
  const sudahPa = data.filter((m) => m.dosenPA && m.id !== mahasiswa?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dosenPAId) return;
    onSubmit(mahasiswa.id, dosenPAId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-500 uppercase tracking-wider font-medium">Mahasiswa</p>
        <p className="font-semibold text-slate-800 text-lg mt-1">{mahasiswa?.nama}</p>
        <div className="flex gap-4 mt-2 text-sm text-slate-600">
          <span>NIM: {mahasiswa?.nim}</span>
          {mahasiswa?.prodi?.nama && <span>Prodi: {mahasiswa.prodi.nama}</span>}
        </div>
        {!mahasiswa?.dosenPA && (
          <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">Belum punya Dosen PA</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Cari & Pilih Dosen PA</label>
        <input
          type="text"
          value={dosenSearch}
          onChange={(e) => setDosenSearch(e.target.value)}
          placeholder="Ketik nama atau NIP dosen..."
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-2"
        />
        <select
          value={dosenPAId}
          onChange={(e) => setDosenPAId(e.target.value)}
          required
          size={Math.min(filteredDosen.length || 1, 6)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">-- Pilih Dosen --</option>
          {filteredDosen.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama} ({d.nip}) — {d._count?.mahasiswas || 0} bimbingan
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">Menampilkan {filteredDosen.length} dari {dosenList.length} dosen</p>
      </div>

      {selectedDosen && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            {selectedDosen.nama.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-slate-800">{selectedDosen.nama}</p>
            <p className="text-sm text-slate-500">NIP: {selectedDosen.nip} | {selectedDosen._count?.mahasiswas || 0} mahasiswa bimbingan</p>
          </div>
        </div>
      )}

      {tanpaPa.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-600 font-medium">{tanpaPa.length} mahasiswa lain juga belum punya Dosen PA</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
        <button type="submit" disabled={!dosenPAId} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm">Simpan</button>
      </div>
    </form>
  );
}
