import { useState } from "react";

export default function MahasiswaForm({ initial, onSubmit, onCancel, dosenList, prodiList }) {
  const [form, setForm] = useState({
    nama: initial?.nama || "",
    nim: initial?.nim || "",
    email: initial?.email || "",
    noHp: initial?.noHp || "",
    prodiId: initial?.prodi?.id || initial?.prodiId || "",
    dosenPAId: initial?.dosenPAId || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nama: form.nama,
      nim: form.nim,
      email: form.email || null,
      noHp: form.noHp || null,
      prodiId: form.prodiId || null,
      dosenPAId: form.dosenPAId || null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
        <input
          type="text"
          name="nama"
          value={form.nama}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
        <input
          type="text"
          name="nim"
          value={form.nim}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
        <input
          type="text"
          name="noHp"
          value={form.noHp}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
        <select
          name="prodiId"
          value={form.prodiId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Program Studi --</option>
          {prodiList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dosen PA</label>
        <select
          name="dosenPAId"
          value={form.dosenPAId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Dosen PA --</option>
          {dosenList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama} ({d.nip})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initial ? "Simpan" : "Tambah"}
        </button>
      </div>
    </form>
  );
}
