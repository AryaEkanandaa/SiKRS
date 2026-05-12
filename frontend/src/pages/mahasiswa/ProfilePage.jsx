import { useState, useEffect } from "react";
import { getMyMahasiswaProfile, updateMyProfile } from "../../services/mahasiswaService";

export default function MahasiswaProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ email: "", noHp: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getMyMahasiswaProfile()
      .then((res) => {
        const p = res.data.mahasiswa;
        setProfile(p);
        setForm({ email: p.email || "", noHp: p.noHp || "" });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Format email tidak valid";
    }
    if (form.noHp) {
      const digits = form.noHp.replace(/\s/g, "");
      if (!/^\d+$/.test(digits)) errs.noHp = "No. HP hanya boleh angka";
      else if (digits.length < 10 || digits.length > 15) errs.noHp = "No. HP harus 10-15 digit";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await updateMyProfile({
        email: form.email || null,
        noHp: form.noHp || null,
      });
      setProfile(res.data.mahasiswa);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setEditing(false);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Gagal menyimpan profil" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ email: profile.email || "", noHp: profile.noHp || "" });
    setErrors({});
    setMessage(null);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold text-slate-700">Profil Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 mt-1">Pastikan akun Anda sudah terhubung dengan data mahasiswa.</p>
      </div>
    );
  }

  const initial = profile.nama.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profil Mahasiswa</h1>
          <p className="text-sm text-slate-400 mt-1">
            {editing ? "Ubah data diri yang diperlukan" : "Informasi akademik dan data diri"}
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profil
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          message.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
            : "bg-red-50 border border-red-200 text-red-600"
        }`}>
          {message.type === "success" ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto text-sm hover:opacity-70">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Identity Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-blue-50 via-blue-100/60 to-white" />
            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 ring-4 ring-white">
                  <span className="text-2xl font-bold text-blue-600">{initial}</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-800 text-center leading-snug">{profile.nama}</h2>
                <p className="text-sm text-slate-400 mt-1 font-mono">{profile.nim}</p>
                {profile.prodi?.nama && (
                  <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                    {profile.prodi.nama}
                  </span>
                )}
              </div>
              <hr className="my-5 border-slate-100" />
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Status Akademik</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-medium text-emerald-600">Aktif</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Angkatan</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">20{profile.nim?.slice(0, 2) || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Diri Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                {editing ? "Edit Data Diri" : "Data Diri"}
              </h3>
            </div>

            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">Nama Lengkap</p>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">{profile.nama}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">NIM</p>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 font-mono">{profile.nim}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">Email</p>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: null }); }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${errors.email ? "border-red-300 bg-red-50" : "border-slate-300"}`}
                    placeholder="email@contoh.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">No. Telepon</p>
                  <input
                    type="text"
                    value={form.noHp}
                    onChange={(e) => { setForm({ ...form, noHp: e.target.value }); setErrors({ ...errors, noHp: null }); }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${errors.noHp ? "border-red-300 bg-red-50" : "border-slate-300"}`}
                    placeholder="08123456789"
                  />
                  {errors.noHp && <p className="text-xs text-red-500 mt-1">{errors.noHp}</p>}
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-1.5">Program Studi</p>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">{profile.prodi?.nama || "-"}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Nama Lengkap</p>
                  <p className="text-sm font-medium text-slate-800 mt-1.5">{profile.nama}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">NIM</p>
                  <p className="text-sm font-medium text-slate-800 mt-1.5 font-mono">{profile.nim}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Email</p>
                  <p className="text-sm text-slate-700 mt-1.5">{profile.email || <span className="text-slate-300 italic">-</span>}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">No. Telepon</p>
                  <p className="text-sm text-slate-700 mt-1.5">{profile.noHp || <span className="text-slate-300 italic">-</span>}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Program Studi</p>
                  <p className="text-sm font-medium text-slate-800 mt-1.5">{profile.prodi?.nama || <span className="text-slate-300 italic">-</span>}</p>
                </div>
              </div>
            )}
          </div>

          {/* Dosen PA Card (read-only) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Dosen Pembimbing Akademik</h3>
              </div>
              {profile.dosenPA ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-emerald-50/80 to-white rounded-xl border border-emerald-100/60">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-xl font-bold text-white">{profile.dosenPA.nama.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{profile.dosenPA.nama}</p>
                    <p className="text-sm text-slate-400 mt-0.5">NIP: {profile.dosenPA.nip}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400">
                      {profile.dosenPA.email && <span>{profile.dosenPA.email}</span>}
                      {profile.dosenPA.noHp && <span>{profile.dosenPA.noHp}</span>}
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[11px] text-slate-400 uppercase">Pembimbing</span>
                    <span className="text-xs font-medium text-emerald-600">Akademik</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Belum memiliki Dosen PA</p>
                  <p className="text-xs text-slate-300 mt-1">Silakan hubungi admin untuk penetapan dosen pembimbing</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Program Studi</p>
                <p className="text-sm font-medium text-slate-700">{profile.prodi?.nama || "-"}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Angkatan</p>
                <p className="text-sm font-medium text-slate-700">20{profile.nim?.slice(0, 2) || "-"}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Status</p>
                <p className="text-sm font-medium text-emerald-600">Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
