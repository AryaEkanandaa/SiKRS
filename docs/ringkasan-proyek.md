# Ringkasan Proyek SiKRS

**Sistem Informasi Kartu Rencana Studi**

---

## 1. Tentang Proyek

SiKRS adalah aplikasi web untuk mengelola data mahasiswa, dosen, dan dosen pembimbing akademik (PA). Dibangun sebagai tugas kuliah Topik Khusus Sistem Informasi.

### Tujuan

- Memudahkan admin mengelola data mahasiswa dan dosen
- Memetakan dosen PA ke mahasiswa
- Memberikan akses informasi bagi mahasiswa (profil + dosen PA) dan dosen (profil + daftar bimbingan)

---

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Backend | Express.js + Prisma ORM 5 |
| Database | PostgreSQL (lokal & Supabase cloud) |
| Cache | Redis Cloud (Redis Labs) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Hosting Frontend | Vercel |
| Hosting Backend | Railway |
| Hosting Database | Supabase |
| Hosting Redis | Redis Cloud |

---

## 3. Riwayat Pengembangan (Prompt & Implementasi)

### Fase 1: Perencanaan

| # | Prompt | Implementasi |
|---|--------|-------------|
| 1 | Minta dibuatkan skema database, endpoint API, dan struktur folder | `prisma/schema.prisma` — 3 tabel (User, Dosen, Mahasiswa) + relasi. 30+ endpoint REST. Folder `backend/` dan `frontend/` terpisah |
| 2 | Setujui plan, minta langsung build semua file | 52 file dibuat: 18 backend, 34 frontend. Express + Prisma + React + Vite + Tailwind |

### Fase 2: Setup & Konfigurasi

| # | Prompt | Implementasi |
|---|--------|-------------|
| 3 | Update .env, buat database, push schema, seed, jalankan backend + frontend | Koneksi PostgreSQL `postgres:root@localhost:5432/krs_system`. Seed admin (admin@krs.com) |
| 4 | Tidak punya Redis, minta solusi tanpa Redis | Redis diganti in-memory cache (Map) — API tetap sama (`getCache`, `setCache`, `delCache`) |
| 5 | Minta Redis wajib dipakai | `ioredis` ditambahkan. `redis.js` di-upgrade: koneksi Redis dengan fallback otomatis ke in-memory cache jika Redis tidak tersedia |

### Fase 3: Fitur Auto-Generate Akun

| # | Prompt | Implementasi |
|---|--------|-------------|
| 6 | Akun user dibuat otomatis saat input Dosen/Mahasiswa. Format email: `kata_terakhir.nim@student.unud.ac.id` (Mhs) dan `kata_pertama.kata_terakhir@unud.ac.id` (Dosen). Password default sesuai aturan | Backend controller diubah — selalu create user dalam 1 transaksi. Form frontend: checkbox "Buat akun" dihapus. Modal sukses menampilkan email + password default |
| 7 | Tambah 30 data dosen dummy ke seed.js | 30 dosen dengan nama khas Bali, NIP format 18 digit, honorifics difilter (I, Ni) |
| 8 | Tambah 100 data mahasiswa dummy ke seed.js | 100 mahasiswa, NIM format 2305551XXX, include data spesifik "Putu Arya Ekananda Kusuma Negara" NIM 2305551057 |

### Fase 4: Program Studi

| # | Prompt | Implementasi |
|---|--------|-------------|
| 9 | Tambah fitur Program Studi | Tabel `ProgramStudi`. Kolom `prodiId` di Mahasiswa. CRUD endpoint. Dropdown prodi di form tambah/edit mahasiswa. Tampil di tabel list |

### Fase 5: Redesign UI (Iterasi 1)

| # | Prompt | Implementasi |
|---|--------|-------------|
| 10 | Redesign seluruh frontend — modern, sidebar icon, animasi | Sidebar `bg-slate-900` dengan SVG icons. Dashboard per-role (admin stats, mhs profile, dosen bimbingan). DataTable modern dengan pagination |
| 11 | Redesign halaman Profil Mahasiswa | Layout 2 kolom (identity card kiri + detail kanan). Gradient header. Avatar modern. Dosen PA mini card. Quick stats row |
| 12 | Redesign halaman Profil Dosen | Sama dengan profil mahasiswa, tema hijau. Daftar bimbingan dengan avatar. Loading skeleton |
| 13 | Redesign halaman Login | Background gradient biru, input icon, show/hide password, loading state button |
| 14 | Redesign halaman Daftar Dosen (mahasiswa) | Search modern, tabel klikable dengan modal detail, pagination modern, skeleton loading |
| 15 | Redesign DataTable + MahasiswaPage + DosenPage (admin) | Search icon, filter tabs belum ada di tahap ini. Stats cards. Avatar di tabel |

### Fase 6: Edit Profil

| # | Prompt | Implementasi |
|---|--------|-------------|
| 16 | Tambah fitur edit profil (email + no HP) untuk mahasiswa | Backend: `PUT /api/mahasiswa/me`. Frontend: toggle edit mode, validasi email & no HP, loading state, success/error message |

### Fase 7: Redesign UI (Iterasi 2) + Filter

| # | Prompt | Implementasi |
|---|--------|-------------|
| 17 | Redesign DataTable + MahasiswaPage + DosenPage — filter tabs, search bar, konfirmasi hapus | `FilterTabs` komponen reusable. Filter status PA (Mhs) dan bimbingan (Dosen). Search bar dengan icon. Konfirmasi modal untuk hapus. Loading skeleton |
| 18 | Redesign UsersPage — filter user type + search | Filter: Semua, Mahasiswa, Dosen, Belum Tertaut. Search email/role/nama. Konfirmasi hapus modal |

### Fase 8: Branding & Navigation

| # | Prompt | Implementasi |
|---|--------|-------------|
| 19 | Ganti branding ke "SiKRS" (Sistem Informasi Kartu Rencana Studi) | Sidebar, login, topbar, footer semua berubah ke SiKRS |
| 20 | Hapus dashboard untuk Mahasiswa dan Dosen. Redirect langsung ke profil | `Dashboard.jsx` hanya untuk admin. Mhs redirect ke `/mahasiswa/profile`, dosen ke `/dosen/profile` |
| 21 | Sidebar admin tambah menu Dashboard | Dashboard link ditambahkan di paling atas sidebar admin |
| 22 | Dropdown user overflow scrollbar | Fix overflow-hidden + absolute positioning |
| 23 | Sidebar full height saat scroll | Root `h-screen flex overflow-hidden`, sidebar `flex-shrink-0`, main content `overflow-y-auto` |

### Fase 9: Hapus Register

| # | Prompt | Implementasi |
|---|--------|-------------|
| 24 | Hapus fitur register — akun hanya dibuat admin | Backend: `register` controller dihapus. Route `POST /register` dihapus. Frontend: `Register.jsx` dihapus. `AuthContext.jsx` — fungsi register dihapus. Link register di login dihapus. Redirect `/register` → `/login` |

### Fase 10: Login Glassmorphism

| # | Prompt | Implementasi |
|---|--------|-------------|
| 25 | Redesign login dengan glassmorphism — neon gradient, floating blobs, backdrop blur | Background `#0a0a1a` + animated gradient. Card `backdrop-blur-xl bg-white/5`. Floating animated blobs. Input glow effect. Button animated gradient. Remember me checkbox |

### Fase 11: Hosting

| # | Prompt | Implementasi |
|---|--------|-------------|
| 26 | Buat dokumentasi hosting lengkap (HOSTING.md) | 12 section: arsitektur, persiapan, hosting DB (Supabase), Redis (Upstash), backend (Render → Railway), frontend (Vercel), CORS, testing, troubleshooting, analisis, checklist |
| 27 | Ganti backend hosting dari Render ke Railway | Railway lebih simple untuk deployment. `railway.json` dibuat. Dokumentasi diupdate |
| 28 | Setup Supabase cloud DB | Push schema + seed via Railway. 1 admin + 30 dosen + 100 mahasiswa + prodi Teknologi Informasi |
| 29 | Setup Redis Cloud (Redis Labs) | Koneksi via `redis://default:xxx@redis-11893.crce302.ap-seast-1-3.ec2.cloud.redislabs.com:11893` |
| 30 | Deploy backend ke Railway | URL: `https://sikrs-production.up.railway.app` — health check OK |
| 31 | Deploy frontend ke Vercel — SPA 404 fix | `vercel.json` dengan rewrites all routes ke `/index.html` |
| 32 | Buat ringkasan proyek | File `docs/ringkasan-proyek.md` ini |

---

## 4. Database Schema

```prisma
enum Role { ADMIN, USER }

model User {
  id          String     @id @default(uuid())
  email       String     @unique
  password    String
  role        Role       @default(USER)
  dosenId     String?    @unique
  dosen       Dosen?     @relation(fields: [dosenId], references: [id])
  mahasiswaId String?    @unique
  mahasiswa   Mahasiswa? @relation(fields: [mahasiswaId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Dosen {
  id         String      @id @default(uuid())
  nama       String
  nip        String      @unique
  email      String?
  noHp       String?
  user       User?
  mahasiswas Mahasiswa[] @relation("DosenPA")
  createdAt  DateTime
  updatedAt  DateTime
}

model ProgramStudi {
  id         String      @id @default(uuid())
  nama       String      @unique
  mahasiswas Mahasiswa[]
  createdAt  DateTime
  updatedAt  DateTime
}

model Mahasiswa {
  id        String        @id @default(uuid())
  nama      String
  nim       String        @unique
  email     String?
  noHp      String?
  prodiId   String?
  prodi     ProgramStudi?
  dosenPAId String?
  dosenPA   Dosen?        @relation("DosenPA")
  user      User?
  createdAt DateTime
  updatedAt DateTime
}
```

---

## 5. Endpoint API

### Auth
| Method | Path | Akses |
|--------|------|-------|
| POST | `/api/auth/login` | Publik |
| GET | `/api/auth/me` | Authenticated |

### Users (Admin only)
| Method | Path |
|--------|------|
| GET | `/api/users` |
| GET | `/api/users/:id` |
| PUT | `/api/users/:id` |
| DELETE | `/api/users/:id` |
| PUT | `/api/users/:id/link` |
| POST | `/api/users/:id/unlink` |

### Dosen
| Method | Path | Akses |
|--------|------|-------|
| GET | `/api/dosen` | Semua role |
| GET | `/api/dosen/:id` | Semua role |
| GET | `/api/dosen/me` | Dosen sendiri |
| GET | `/api/dosen/me/mahasiswa` | Dosen sendiri |
| POST | `/api/dosen` | Admin |
| PUT | `/api/dosen/:id` | Admin |
| DELETE | `/api/dosen/:id` | Admin |

### Mahasiswa
| Method | Path | Akses |
|--------|------|-------|
| GET | `/api/mahasiswa` | Admin + Dosen |
| GET | `/api/mahasiswa/:id` | Admin + Dosen |
| GET | `/api/mahasiswa/me` | Mahasiswa sendiri |
| GET | `/api/mahasiswa/me/dosen-pa` | Mahasiswa sendiri |
| PUT | `/api/mahasiswa/me` | Mahasiswa sendiri |
| POST | `/api/mahasiswa` | Admin |
| PUT | `/api/mahasiswa/:id` | Admin |
| DELETE | `/api/mahasiswa/:id` | Admin |
| PUT | `/api/mahasiswa/:id/pa` | Admin |

### Program Studi
| Method | Path | Akses |
|--------|------|-------|
| GET | `/api/program-studi` | Semua role |
| POST | `/api/program-studi` | Admin |
| PUT | `/api/program-studi/:id` | Admin |
| DELETE | `/api/program-studi/:id` | Admin |

### Utility
| Method | Path | Akses |
|--------|------|-------|
| POST | `/api/cache/clear` | Admin |
| GET | `/api/health` | Publik |

---

## 6. Struktur Folder Final

```
krs-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js              # 1 admin + 30 dosen + 1 prodi + 100 mhs
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── dosenController.js
│   │   │   ├── mahasiswaController.js
│   │   │   └── programStudiController.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification
│   │   │   └── roleGuard.js      # ADMIN/USER role check
│   │   ├── routes/
│   │   ├── utils/
│   │   │   ├── prisma.js
│   │   │   ├── redis.js          # Redis + in-memory fallback
│   │   │   └── asyncHandler.js
│   │   └── index.js
│   ├── railway.json
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/           # Sidebar + Layout (h-screen, scroll)
│   │   │   ├── Forms/            # MahasiswaForm, DosenForm, AssignPaForm, LinkUserForm
│   │   │   ├── DataTable.jsx     # Reusable dengan pagination + skeleton + search
│   │   │   ├── FilterTabs.jsx    # Reusable pill filter
│   │   │   ├── Modal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Glassmorphism
│   │   │   ├── Dashboard.jsx     # Admin only
│   │   │   ├── admin/            # MahasiswaPage, DosenPage, UsersPage
│   │   │   ├── mahasiswa/        # ProfilePage, DosenListPage
│   │   │   └── dosen/            # ProfilePage, BimbinganPage
│   │   ├── services/             # API layer (axios)
│   │   ├── context/              # AuthContext (JWT)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json               # SPA rewrites
│   ├── .env.example
│   └── package.json
├── docs/
│   └── ringkasan-proyek.md       # File ini
├── HOSTING.md                     # Dokumentasi hosting lengkap
├── README.md
└── .gitignore
```

---

## 7. Seed Data

| Data | Jumlah |
|------|--------|
| Admin | 1 (admin@krs.com / admin123) |
| Dosen | 30 (nama khas Bali, NIP 18 digit) |
| Program Studi | 1 (Teknologi Informasi) |
| Mahasiswa | 100 (NIM 2305551001 - 2305551100) |

**Data spesifik mahasiswa:**
- Putu Arya Ekananda Kusuma Negara
- NIM: 2305551057
- Email: negara.2305551057@student.unud.ac.id
- Password: 2305551057

---

## 8. Hosting

| Komponen | Platform | URL |
|----------|----------|-----|
| Frontend | Vercel | `https://sikrs.vercel.app` |
| Backend | Railway | `https://sikrs-production.up.railway.app` |
| Database | Supabase | PostgreSQL cloud (pooler:6543) |
| Cache | Redis Cloud | Redis Labs (redis-11893) |

**Environment variables backend:**
| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.hinyfrizwtkgnzaphdjc:xxx@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` |
| `REDIS_URL` | `redis://default:xxx@redis-11893.crce302.ap-seast-1-3.ec2.cloud.redislabs.com:11893` |
| `JWT_SECRET` | `sikrs-jwt-secret-2026` |
| `JWT_EXPIRES_IN` | `7d` |

---

## 9. Akun Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@krs.com | admin123 |
| Dosen | wayan.sudarsana@unud.ac.id | wayan123 |
| Dosen | made.suryani@unud.ac.id | made123 |
| Mahasiswa | negara.2305551057@student.unud.ac.id | 2305551057 |

Semua password dosen: `kata_pertama_nama` (lowercase, tanpa honorifik I/Ni) + "123"
Semua password mahasiswa: NIM

---

## 10. Fitur Aplikasi

### Role Admin
- Dashboard dengan statistik (total mahasiswa, dosen, prodi, assign PA)
- CRUD Mahasiswa + filter status PA
- CRUD Dosen + filter status bimbingan
- Assign / ubah Dosen PA ke mahasiswa
- Manajemen User (link/unlink akun ke data)
- Refresh cache
- Auto-generate akun saat input data baru

### Role Mahasiswa
- Lihat & edit profil (email, no HP)
- Lihat info Dosen PA
- Cari & lihat daftar dosen (read-only)

### Role Dosen
- Lihat & edit profil (email, no HP)
- Lihat daftar mahasiswa bimbingan

### Fitum Umum
- Login dengan JWT
- Caching dengan Redis (fallback in-memory)
- Pencarian & filter data
- Pagination
- Responsive mobile
- Loading skeleton
- Konfirmasi hapus

---

## 11. Keputusan Arsitektur

### Mengapa auto-generate akun?
- Admin tidak perlu input email/password manual
- Format email konsisten berdasarkan aturan universitas
- Password default mudah diingat (bisa diubah nanti)

### Mengapa Redis?
- Mempercepat akses data lookup (daftar dosen, mahasiswa)
- Mengurangi beban query ke database
- Fallback ke in-memory cache jika Redis tidak tersedia

### Mengapa filter di frontend?
- Data sudah di-cache, filter frontend lebih cepat tanpa request baru
- Jumlah data tidak terlalu besar (30 dosen, 100 mahasiswa)
- Backend endpoint tetap mendukung search parameter

### Mengapa glassmorphism login?
- Tampilan lebih premium dan modern
- Membedakan pengalaman admin dengan dashboard yang lebih profesional
- Animasi dan glow effect memberikan kesan aplikasi yang serius

---

## 12. Catatan Pengembangan

- **Total file:** ~60 file (backend + frontend)
- **Total prompt:** 32 iterasi
- **Perubahan terbesar:** Redesign UI 3 kali (awal → modern → glassmorphism login)
- **Keputusan berubah:** Hosting backend (Render → Railway), Caching (in-memory → Redis)
- **Fitur yang dihapus:** Register (akun mandiri), Dashboard untuk non-admin
- **Fitur ditambahkan:** Auto-generate akun, Program Studi, Filter tabs, Edit profil, Refresh cache
