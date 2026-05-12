import { useState, useEffect } from "react";
import { getMyDosenProfile, getMyMahasiswaBimbingan } from "../../services/dosenService";
import { updateMyProfile } from "../../services/mahasiswaService";
import Modal from "../../components/Modal";

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-100 rounded ${className}`} />;
}

export default function DosenProfilePage() {
  const [profile, setProfile] = useState(null);
  const [bimbingan, setBimbingan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMhs, setSelectedMhs] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ email: "", noHp: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([getMyDosenProfile(), getMyMahasiswaBimbingan()])
      .then(([pRes, bRes]) => {
        const p = pRes.data.dosen;
        setProfile(p);
        setForm({ email: p.email || "", noHp: p.noHp || "" });
        setBimbingan(bRes.data.mahasiswa);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Format email tidak valid";
    if (form.noHp) {
      const d = form.noHp.replace(/\s/g, "");
      if (!/^\d+$/.test(d)) errs.noHp = "Hanya angka";
      else if (d.length < 10 || d.length > 15) errs.noHp = "10-15 digit";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setMessage(null);
    try {
      const res = await updateMyProfile({ email: form.email || null, noHp: form.noHp || null });
      setProfile(res.data.mahasiswa);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setEditing(false);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Gagal menyimpan" });
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({ email: profile.email || "", noHp: profile.noHp || "" });
    setErrors({}); setMessage(null); setEditing(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1"><div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"><Skeleton className="h-32" /><div className="p-6 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-32" /></div></div></div>
          <div className="lg:col-span-2 space-y-6"><div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"><Skeleton className="h-5 w-24" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-2/3" /></div></div>
        </div>
      </div>
    );
  }

  if (!profile) return (
    <div className="max-w-xl mx-auto text-center py-20">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-lg font-semibold text-slate-700">Profil Tidak Ditemukan</h2>
      <p className="text-sm text-slate-400 mt-1">Pastikan akun Anda sudah terhubung dengan data dosen.</p>
    </div>
  );

  const initial = profile.nama.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profil Dosen</h1>
          <p className="text-sm text-slate-400 mt-1">Informasi akademik dan data diri</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-sm font-medium transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profil
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} disabled={saving} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-medium transition-colors">Batal</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-sm font-medium transition-all shadow-sm disabled:opacity-60">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</> : <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Simpan
              </>}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-600"
        }`}>
          {message.type === "success" ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Identity Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600" />
            <div className="px-6 pb-6 -mt-14">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center ring-4 ring-white mb-4">
                  <span className="text-2xl font-bold text-emerald-600">{initial}</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-800 text-center">{profile.nama}</h2>
                <p className="text-sm text-slate-400 mt-1 font-mono">{profile.nip}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Dosen Aktif
                </span>
              </div>
              <hr className="my-5 border-slate-100" />
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Total Bimbingan</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{bimbingan.length}</p>
                  <p className="text-xs text-slate-400">mahasiswa</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">NIP</p>
                  <p className="text-sm font-mono text-slate-600 mt-1">{profile.nip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Diri */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-700">{editing ? "Edit Data Diri" : "Data Diri"}</h3>
            </div>

            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">Nama Lengkap</p>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg">{profile.nama}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">NIP</p>
                  <p className="text-sm font-mono text-slate-800 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg">{profile.nip}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">Email</p>
                  <input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: null }); }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${errors.email ? "border-red-300 bg-red-50" : "border-slate-300"}`} placeholder="email@contoh.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">No. Telepon</p>
                  <input type="text" value={form.noHp} onChange={(e) => { setForm({ ...form, noHp: e.target.value }); setErrors({ ...errors, noHp: null }); }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow ${errors.noHp ? "border-red-300 bg-red-50" : "border-slate-300"}`} placeholder="08123456789" />
                  {errors.noHp && <p className="text-xs text-red-500 mt-1">{errors.noHp}</p>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div><p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Nama Lengkap</p><p className="text-sm font-medium text-slate-800 mt-1.5">{profile.nama}</p></div>
                <div><p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">NIP</p><p className="text-sm font-mono text-slate-800 mt-1.5">{profile.nip}</p></div>
                <div><p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Email</p><p className="text-sm text-slate-700 mt-1.5">{profile.email || <span className="text-slate-300 italic">-</span>}</p></div>
                <div><p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">No. Telepon</p><p className="text-sm text-slate-700 mt-1.5">{profile.noHp || <span className="text-slate-300 italic">-</span>}</p></div>
              </div>
            )}
          </div>

          {/* Mahasiswa Bimbingan */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Mahasiswa Bimbingan</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {bimbingan.length} mahasiswa
                </span>
              </div>

              {bimbingan.length > 0 ? (
                <div className="space-y-2">
                  {bimbingan.map((m, i) => (
                    <div key={m.id} onClick={() => setSelectedMhs(m)} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50/60 rounded-xl cursor-pointer transition-all duration-150 group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                          {m.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{m.nama}</p>
                          <p className="text-xs text-slate-400 font-mono">{m.nim}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 hidden sm:block">{m.email || "-"}</span>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Belum memiliki mahasiswa bimbingan</p>
                  <p className="text-xs text-slate-300 mt-1">Data akan muncul setelah admin melakukan assign</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div><p className="text-[11px] text-slate-400 uppercase tracking-wider">Mahasiswa Bimbingan</p><p className="text-sm font-semibold text-slate-700">{bimbingan.length} orang</p></div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div><p className="text-[11px] text-slate-400 uppercase tracking-wider">Status</p><p className="text-sm font-semibold text-emerald-600">Dosen Aktif</p></div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div><p className="text-[11px] text-slate-400 uppercase tracking-wider">Terdaftar Sejak</p><p className="text-sm font-semibold text-slate-700">{new Date(profile.createdAt).getFullYear() || "-"}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Mahasiswa Modal */}
      <Modal isOpen={!!selectedMhs} onClose={() => setSelectedMhs(null)} title="Detail Mahasiswa">
        {selectedMhs && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                {selectedMhs.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{selectedMhs.nama}</p>
                <p className="text-sm text-slate-400 font-mono">{selectedMhs.nim}</p>
              </div>
            </div>
            <hr className="border-slate-100" />
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">NIM</p><p className="text-sm font-medium text-slate-800 mt-1">{selectedMhs.nim}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Nama</p><p className="text-sm font-medium text-slate-800 mt-1">{selectedMhs.nama}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Email</p><p className="text-sm text-slate-700 mt-1">{selectedMhs.email || "-"}</p></div>
              <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">No. HP</p><p className="text-sm text-slate-700 mt-1">{selectedMhs.noHp || "-"}</p></div>
            </div>
            <button onClick={() => setSelectedMhs(null)} className="w-full py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-sm font-medium transition-colors">Tutup</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
