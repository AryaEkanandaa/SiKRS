import { useState, useEffect } from "react";
import { getDosen } from "../../services/dosenService";
import { getMahasiswa } from "../../services/mahasiswaService";

export default function LinkUserForm({ user, onSubmit, onCancel }) {
  const [entityType, setEntityType] = useState("DOSEN");
  const [entityId, setEntityId] = useState("");
  const [dosenList, setDosenList] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDosen(), getMahasiswa()])
      .then(([dRes, mRes]) => {
        setDosenList(dRes.data.dosen);
        setMahasiswaList(mRes.data.mahasiswa);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const entityList = entityType === "DOSEN" ? dosenList : mahasiswaList;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entityId) return;
    onSubmit(user.id, entityType, entityId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Link user: <strong>{user?.email}</strong>
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
        <select
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setEntityId(""); }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="DOSEN">Dosen</option>
          <option value="MAHASISWA">Mahasiswa</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {entityType === "DOSEN" ? "Pilih Dosen" : "Pilih Mahasiswa"}
        </label>
        <select
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih --</option>
          {loading ? (
            <option disabled>Loading...</option>
          ) : (
            entityList
              .filter((e) => !e.userId)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nama} ({entityType === "DOSEN" ? e.nip : e.nim})
                </option>
              ))
          )}
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
          Link
        </button>
      </div>
    </form>
  );
}
