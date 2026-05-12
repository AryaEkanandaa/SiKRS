import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMahasiswa } from "../services/mahasiswaService";
import { getDosen } from "../services/dosenService";
import { getProgramStudi } from "../services/programStudiService";

function SkeletonStat() {
  return <div className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse"><div className="h-4 bg-slate-100 rounded w-20 mb-3" /><div className="h-8 bg-slate-100 rounded w-12" /></div>;
}

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") return <AdminDashboard />;

  if (user?.mahasiswaId) {
    window.location.href = "/mahasiswa/profile";
    return null;
  }
  if (user?.dosenId) {
    window.location.href = "/dosen/profile";
    return null;
  }

  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">👋</div>
      <h2 className="text-2xl font-bold text-slate-700">Selamat Datang</h2>
      <p className="text-slate-500 mt-2">Akun Anda belum terhubung dengan data Dosen atau Mahasiswa. Silakan hubungi admin.</p>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getMahasiswa(), getDosen(), getProgramStudi()])
      .then(([mRes, dRes, pRes]) => {
        const mahasiswa = mRes.data.mahasiswa;
        const dosen = dRes.data.dosen;
        const totalMhs = mahasiswa.length;
        const withPa = mahasiswa.filter((m) => m.dosenPA).length;
        const withoutPa = totalMhs - withPa;
        const dosenWithoutMhs = dosen.filter((d) => d._count?.mahasiswas === 0).length;
        const pct = totalMhs > 0 ? Math.round((withPa / totalMhs) * 100) : 0;
        setStats({ totalMhs, totalDosen: dosen.length, totalProdi: pRes.data.programStudi.length, withPa, withoutPa, dosenWithoutMhs, pct });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { label: "Kelola Mahasiswa", desc: `${stats?.totalMhs || 0} mahasiswa terdaftar`, to: "/admin/mahasiswa", color: "from-blue-500 to-blue-600", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Kelola Dosen", desc: `${stats?.totalDosen || 0} dosen terdaftar`, to: "/admin/dosen", color: "from-emerald-500 to-emerald-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Assign Dosen PA", desc: `${stats?.withoutPa || 0} mahasiswa belum punya PA`, to: "/admin/mahasiswa", color: "from-amber-500 to-amber-600", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Kelola Users", desc: `${stats?.totalMhs + stats?.totalDosen || 0} akun terintegrasi`, to: "/admin/users", color: "from-violet-500 to-violet-600", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Admin — SiKRS</h1>
        <p className="text-sm text-slate-400 mt-1">Ringkasan sistem informasi Kartu Rencana Studi</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Mahasiswa", value: stats.totalMhs, color: "from-blue-400 to-blue-600", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { label: "Total Dosen", value: stats.totalDosen, color: "from-emerald-400 to-emerald-600", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
              { label: "Program Studi", value: stats.totalProdi, color: "from-violet-400 to-violet-600", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
              { label: "Assign PA", value: `${stats.pct}%`, color: "from-amber-400 to-amber-600", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{s.label}</p><p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p></div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center shadow-sm`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <p className="text-sm font-semibold text-emerald-800">Sudah Punya Dosen PA</p>
              </div>
              <p className="text-3xl font-bold text-emerald-700">{stats.withPa}</p>
              <p className="text-xs text-emerald-500 mt-1">mahasiswa sudah ter-assign</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <p className="text-sm font-semibold text-rose-800">Belum Punya Dosen PA</p>
              </div>
              <p className="text-3xl font-bold text-rose-700">{stats.withoutPa}</p>
              <p className="text-xs text-rose-500 mt-1">prioritas untuk di-assign</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div>
                <p className="text-sm font-semibold text-amber-800">Dosen Tanpa Bimbingan</p>
              </div>
              <p className="text-3xl font-bold text-amber-700">{stats.dosenWithoutMhs}</p>
              <p className="text-xs text-amber-500 mt-1">dosen belum punya mahasiswa bimbingan</p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Akses Cepat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((act, i) => (
                <button key={i} onClick={() => navigate(act.to)} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all text-left group">
                  <div className={`w-10 h-10 bg-gradient-to-br ${act.color} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={act.icon} /></svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{act.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{act.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
