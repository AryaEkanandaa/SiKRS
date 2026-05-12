# Dokumentasi Hosting Aplikasi SiKRS

**Sistem Informasi Kartu Rencana Studi**

---

## Daftar Isi

1. [Arsitektur Aplikasi](#1-arsitektur-aplikasi)
2. [Ringkasan Teknologi yang Digunakan](#2-ringkasan-teknologi-yang-digunakan)
3. [Persiapan Sebelum Hosting](#3-persiapan-sebelum-hosting)
4. [Hosting Database PostgreSQL (Supabase)](#4-hosting-database-postgresql-supabase)
5. [Hosting Redis Cache (Upstash)](#5-hosting-redis-cache-upstash)
6. [Hosting Backend (Railway)](#6-hosting-backend-Railway)
7. [Hosting Frontend (Vercel)](#7-hosting-frontend-vercel)
8. [Konfigurasi CORS](#8-konfigurasi-cors)
9. [Testing Setelah Hosting](#9-testing-setelah-hosting)
10. [Troubleshooting](#10-troubleshooting)
11. [Analisis Pemilihan PaaS](#11-analisis-pemilihan-paas)
12. [Checklist Akhir Hosting](#12-checklist-akhir-hosting)

---

## 1. Arsitektur Aplikasi

```
  [Browser Pengguna]
         |
         | (HTTPS)
         v
  +------------------+        +-------------------+        +-------------------+
  |                  |  API   |                   |  SQL   |                   |
  |   Vercel         |------->|   Railway          |------->|   Supabase        |
  |   (Frontend)     |        |   (Backend API)   |        |   (PostgreSQL)    |
  |   React + Vite   |        |   Express + Prisma|        |   Cloud Database  |
  |                  |        |                   |        |                   |
  +------------------+        +-------------------+        +-------------------+
                                        |
                                        | (cache)
                                        v
                               +-------------------+
                               |                   |
                               |   Upstash Redis   |
                               |   (Cloud Cache)   |
                               |                   |
                               +-------------------+
```

**Penjelasan Alur:**

1. Pengguna membuka aplikasi melalui browser
2. Browser memuat frontend dari **Vercel** (CDN global)
3. Frontend mengirim permintaan data ke backend di **Railway**
4. Backend membaca/menulis data ke database **Supabase PostgreSQL**
5. Backend menyimpan cache ke **Upstash Redis** untuk mempercepat akses data
6. Jika Redis tidak tersedia, backend otomatis menggunakan cache internal (in-memory)
6. Hasil data dikembalikan ke frontend dan ditampilkan ke pengguna

---

## 2. Ringkasan Teknologi yang Digunakan

| Komponen | Teknologi | Platform Hosting |
|----------|-----------|------------------|
| **Frontend** | React 18 + Vite + Tailwind CSS | **Vercel** |
| **Backend** | Express.js + Prisma ORM | **Railway** |
| **Database** | PostgreSQL | **Supabase** (atau Neon) |
| **Caching** | Redis via ioredis | **Upstash Redis** (atau Redis Cloud) |
| **Autentikasi** | JWT (jsonwebtoken) | Built-in di backend |

> **Catatan:** Aplikasi menggunakan **Redis** untuk caching data lookup (daftar dosen, daftar mahasiswa) agar performa lebih cepat. Jika Redis tidak tersedia, backend akan otomatis fallback ke cache internal. Namun untuk production, Redis sangat disarankan.

---

## 3. Persiapan Sebelum Hosting

Sebelum memulai proses hosting, pastikan hal-hal berikut sudah siap:

### 3.1 Project sudah diupload ke GitHub

Buat repository di GitHub dan upload seluruh folder project `krs-system`. Struktur foldernya adalah:

```
krs-system/
├── backend/          # Folder backend Express.js
│   ├── prisma/       # Schema database
│   ├── src/          # Kode backend
│   ├── package.json
│   └── .env
├── frontend/         # Folder frontend React
│   ├── src/          # Kode frontend
│   ├── package.json
│   └── .env
└── README.md
```

### 3.2 File Environment Variable

Kedua folder (`backend/` dan `frontend/`) sudah memiliki file `.env` sendiri. File-file ini sudah benar dipisahkan sesuai kebutuhan masing-masing.

**Backend** membaca environment variable dari file `.env` dan `process.env`:

| Variable | Deskripsi | Contoh Lokal | Contoh Production |
|----------|-----------|-------------|-------------------|
| `DATABASE_URL` | URL koneksi PostgreSQL | `postgresql://...` | Dari Supabase |
| `JWT_SECRET` | Kunci rahasia JWT | `krs-system-jwt-secret-key-2026` | Bisa sama atau diganti |
| `JWT_EXPIRES_IN` | Masa berlaku token | `7d` | `7d` |
| `REDIS_URL` | URL koneksi Redis | `redis://localhost:6379` | Dari Upstash |
| `PORT` | Port server | `5000` | Otomatis dari Railway |

**Frontend** membaca:

| Variable | Deskripsi | Contoh Lokal | Contoh Production |
|----------|-----------|-------------|-------------------|
| `VITE_API_URL` | URL Backend API | `http://localhost:5000/api` | `https://backend-api.up.railway.app/api` |

### 3.3 Script Build dan Start

**Backend (`backend/package.json`):**

```json
"scripts": {
  "start": "node src/index.js",        // Untuk production
  "prisma:generate": "prisma generate",  // Generate Prisma Client
  "prisma:push": "prisma db push",      // Push schema ke DB
  "prisma:seed": "node prisma/seed.js"  // Seed data awal
}
```

**Frontend (`frontend/package.json`):**

```json
"scripts": {
  "dev": "vite",           // Development
  "build": "vite build",   // Build untuk production
  "preview": "vite preview"
}
```

> Build frontend menghasilkan folder `dist/` yang akan diupload ke Vercel.

---

## 4. Hosting Database PostgreSQL (Supabase)

Supabase adalah platform PostgreSQL cloud yang menyediakan dashboard web (UI) gratis untuk membuat dan mengelola database.

### Langkah-langkah:

**1. Buka situs Supabase**

Buka [https://supabase.com](https://supabase.com) dan klik **"Start your project"** atau **"Sign In"** jika sudah punya akun. Login menggunakan akun GitHub.

**2. Buat project baru**

- Klik tombol **"New project"**
- Isi **Name**: `sikrs-database` (atau nama yang Anda inginkan)
- Isi **Database Password**: buat password yang kuat dan simpan (misal: `SiKRS2024!`)
- Pilih **Region**: pilih yang terdekat, misal **Singapore** (asia-southeast-1)
- **Pricing Plan**: pilih **Free Plan** (cukup untuk development dan tugas)
- Klik **"Create new project"**

Tunggu beberapa saat hingga project selesai dibuat (sekitar 2-5 menit).

**3. Ambil Connection String (DATABASE_URL)**

Setelah project selesai:

- Di dashboard project, buka menu **Project Settings** (ikon gear di sidebar kiri bawah)
- Pilih tab **Database**
- Scroll ke bagian **Connection string**
- Pilih tab **URI**
- Copy teks connection string yang muncul, formatnya seperti ini:

```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
```

- **Ganti `[YOUR-PASSWORD]`** dengan password yang Anda buat tadi
- **Ganti `[YOUR-PROJECT-REF]`** dengan referensi project Anda

Connection string inilah yang akan menjadi nilai `DATABASE_URL` di environment variable backend nantinya.

> **Catatan Penting:** Connection string ini berisi password. Jangan pernah membagikannya ke siapapun.

**4. Setup Schema Database (Migrasi)**

Untuk membuat tabel-tabel di database cloud, lakukan langkah berikut:

a. Di dashboard Supabase, buka menu **SQL Editor** (di sidebar kiri)

b. Klik **"New Query"**

c. Copy seluruh isi file `backend/prisma/schema.prisma` dari project Anda. Tapi karena ini file Prisma (bukan SQL murni), kita perlu mendapatkan script SQL-nya.

> **Alternatif tanpa terminal:** Gunakan fitur **Prisma Migrate** melalui dashboard Railway nanti. Saat pertama kali deploy backend, kita akan menjalankan perintah `prisma db push` dari **Railway Shell/Console** (dashboard web Railway — tanpa terminal lokal).

Atau, Anda bisa menggunakan SQL Editor Supabase dengan menjalankan SQL berikut secara manual:

1. Buka **SQL Editor** di dashboard Supabase
2. Copy paste script SQL di bawah ini
3. Klik **"Run"**

```sql
-- Tabel User
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    "dosenId" TEXT UNIQUE,
    "mahasiswaId" TEXT UNIQUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabel Dosen
CREATE TABLE "Dosen" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    nip TEXT UNIQUE NOT NULL,
    email TEXT,
    "noHp" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabel ProgramStudi
CREATE TABLE "ProgramStudi" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabel Mahasiswa
CREATE TABLE "Mahasiswa" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    nim TEXT UNIQUE NOT NULL,
    email TEXT,
    "noHp" TEXT,
    "prodiId" TEXT REFERENCES "ProgramStudi"(id),
    "dosenPAId" TEXT REFERENCES "Dosen"(id),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

Ulangi langkah ini jika ada tabel lain yang perlu dibuat.

**5. (Opsional) Seeding Data Awal**

Jika ingin memasukkan data awal (admin, dosen, mahasiswa), Anda bisa melakukannya melalui:

a. **Railway Console** (setelah backend ter-deploy): Jalankan perintah seed melalui dashboard Railway
b. **SQL Editor Supabase**: Insert data manual dengan query SQL

Cara termudah: lakukan seeding setelah backend ter-deploy melalui menu **Shell** di dashboard Railway.

---

## 5. Hosting Redis Cache (Upstash)

Upstash adalah platform Redis cloud dengan dashboard web gratis yang mudah digunakan.

### Langkah-langkah:

**1. Buka situs Upstash**

Buka [https://upstash.com](https://upstash.com) dan klik **"Get Started"** atau login dengan akun GitHub.

**2. Buat database Redis baru**

- Klik tombol **"Create Database"**
- Isi **Database Name**: `sikrs-cache`
- Pilih **Region**: pilih yang terdekat, misal **Singapore**
- **Tier**: pilih **Free** (cukup untuk development, maksimal 256 MB)
- Klik **"Create"**

**3. Ambil REDIS_URL**

Setelah database dibuat:

- Di halaman detail database, cari bagian **"REST API"** atau **"Redis Connection"**
- Copy URL pada field **"UPSTASH_REDIS_REST_URL"** atau **"Endpoint"**

Format URL Redis dari Upstash biasanya seperti ini:

```
rediss://default:YOUR_TOKEN@us1-robust-whale-12345.upstash.io:6379
```

> **Catatan:** URL ini mengandung token rahasia. Jangan pernah membagikannya.

**4. Simpan sebagai environment variable**

URL ini akan digunakan sebagai nilai `REDIS_URL` di environment variable backend pada Railway nantinya.

### Verifikasi Koneksi

Setelah backend ter-deploy dengan `REDIS_URL` yang benar, backend akan otomatis terhubung ke Redis Cloud untuk menyimpan cache. Data seperti daftar dosen dan mahasiswa akan di-cache dengan TTL (time-to-live) default 1 jam.

Jika koneksi Redis gagal (misalnya URL salah), backend tidak akan crash — ia akan otomatis fallback ke **in-memory cache** dan tetap berjalan normal.

---

## 6. Hosting Backend (Railway)

Railway adalah platform PaaS untuk hosting aplikasi backend dengan mudah melalui dashboard web. Railway mendukung Node.js secara native dan terintegrasi langsung dengan GitHub.

### Langkah-langkah:

**1. Buka Railway dan Login**

Buka [https://railway.app](https://railway.app). Klik **"Start a New Project"** atau **"Login"** menggunakan akun GitHub.

**2. Buat Project Baru**

- Setelah login, klik tombol **"New Project"** di dashboard
- Pilih **"Deploy from GitHub repo"**
- Pilih repository GitHub Anda (`SiKRS`)
- Jika repository tidak muncul, klik **"Configure GitHub Apps"** dan beri akses ke repository SiKRS

**3. Konfigurasi Service**

Setelah repository terhubung, Railway akan otomatis mendeteksi project. Lakukan konfigurasi:

| Field | Nilai |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `node src/index.js` |
| **Plan** | **Free Trial** (cukup $5 credit gratis untuk development) |

> **Penjelasan Build Command:**
> - `npm install` — menginstall semua dependensi (Express, Prisma, ioredis, dll)
> - `npx prisma generate` — generate Prisma Client dari file `schema.prisma`
>
> **Catatan:** `npx prisma db push` **tidak perlu** dimasukkan karena schema database sudah ter-push ke Supabase dari lokal.

**4. Set Environment Variable**

Di tab **Variables** atau **Settings** service, tambahkan environment variable berikut:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.hinyfrizwtkgnzaphdjc:SiKRS2026%21%21@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` |
| `REDIS_URL` | `redis://default:e3piVOm4hrCRnfDhlEg9VysURqDuQqTw@redis-11893.crce302.ap-seast-1-3.ec2.cloud.redislabs.com:11893` |
| `JWT_SECRET` | `sikrs-jwt-secret-key-2026` (atau kunci rahasia Anda sendiri) |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | Biarkan kosong — Railway akan mengatur port otomatis |

**5. Deploy**

- Railway akan otomatis memulai proses build dan deploy setelah konfigurasi selesai
- Proses pertama biasanya memakan waktu 2-5 menit
- Pantau log di dashboard untuk melihat progress

**6. Ambil URL Backend**

Setelah deploy selesai:

- Di dashboard Railway, buka tab **Settings** → **Networking**
- Railway akan memberikan URL seperti:
  `https://sikrs-backend.up.railway.app`

- Uji coba dengan membuka `https://sikrs-backend.up.railway.app/api/health`
- Jika muncul `{"status":"ok"}`, berarti backend sudah berjalan

> **Catatan:** URL ini akan digunakan sebagai nilai `VITE_API_URL` di frontend Vercel nanti.

---

## 7. Hosting Frontend (Vercel)

Vercel adalah platform hosting untuk frontend dengan integrasi GitHub yang sangat mudah.

### Langkah-langkah:

**1. Buka Vercel dan Login**

Buka [https://vercel.com](https://vercel.com). Klik **"Sign Up"** atau **"Log In"** menggunakan akun GitHub.

**2. Import Repository GitHub**

- Setelah login, klik tombol **"Add New..."** di pojok kanan atas
- Pilih **"Project"**
- Pilih repository GitHub Anda (`krs-system`)
- Klik **"Import"**

**3. Konfigurasi Project**

Isi form dengan detail berikut:

| Field | Nilai |
|-------|-------|
| **Framework Preset** | `Vite` (Vercel biasanya mendeteksi otomatis) |
| **Root Directory** | `frontend` (pilih folder frontend) |
| **Build Command** | `npm run build` (terisi otomatis) |
| **Output Directory** | `dist` (terisi otomatis) |

**4. Set Environment Variable**

Klik tombol **"Environment Variables"** dan tambahkan:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://sikrs-backend.up.railway.app/api` (URL backend dari Railway, **jangan pakai http://localhost**) |

> **PENTING!** Pastikan `VITE_API_URL` diisi dengan URL backend production, bukan localhost. Jika masih menggunakan `http://localhost:5000/api`, aplikasi tidak akan bisa terhubung ke backend.

**5. Deploy**

- Klik tombol **"Deploy"** di bagian bawah
- Vercel akan otomatis mem-build dan mendeploy frontend
- Proses biasanya selesai dalam 1-3 menit

**6. Ambil URL Frontend**

Setelah deploy selesai:

- Vercel akan memberikan URL seperti:
  `https://sikrs-frontend.vercel.app`

- Buka URL tersebut di browser. Aplikasi SiKRS sudah bisa digunakan!

> **Catatan:** Jika ingin menggunakan custom domain (misal: `sikrs.com`), bisa diatur di menu **Domains** dashboard Vercel.

---

## 8. Konfigurasi CORS

CORS (Cross-Origin Resource Sharing) diperlukan agar backend mengizinkan permintaan dari domain frontend yang berbeda.

Backend Anda sudah menggunakan package `cors` dan dikonfigurasi di file `backend/src/index.js`:

```javascript
app.use(cors());
```

Saat ini, CORS sudah diatur agar menerima permintaan dari **semua domain** (dengan `cors()` tanpa parameter). Ini sudah cukup untuk tahap development dan tugas.

**Untuk production yang lebih aman**, Anda bisa mengganti konfigurasi CORS hanya untuk domain tertentu:

```javascript
app.use(cors({
  origin: ["https://sikrs-frontend.vercel.app", "https://your-custom-domain.com"]
}));
```

**Yang perlu diingat:**

- Jika backend di `https://sikrs-backend.up.railway.app`
- Dan frontend di `https://sikrs-frontend.vercel.app`
- Maka CORS harus mengizinkan `https://sikrs-frontend.vercel.app`

Konfigurasi saat ini (`cors()` tanpa parameter) sudah mengizinkan semua domain, jadi tidak perlu khawatir CORS error.

---

## 9. Testing Setelah Hosting

Setelah semua komponen ter-deploy, lakukan pengujian berikut:

### 8.1 Cek Koneksi Backend

Buka URL: `https://sikrs-backend.up.railway.app/api/health`

**Hasil yang diharapkan:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-12T..."
}
```

### 8.2 Cek Aplikasi Frontend

Buka URL frontend: `https://sikrs-frontend.vercel.app`

### 8.3 Skenario Testing

| No | Skenario | Langkah | Hasil Diharapkan |
|----|----------|---------|------------------|
| 1 | Login Admin | Buka login, masukkan `admin@krs.com` / `admin123` | Masuk ke dashboard admin |
| 2 | Login Mahasiswa | Buka login, masukkan email mahasiswa | Masuk ke profil mahasiswa |
| 3 | Login Dosen | Buka login, masukkan email dosen | Masuk ke profil dosen |
| 4 | CRUD Mahasiswa (Admin) | Tambah/edit/hapus mahasiswa | Data berubah di tabel |
| 5 | CRUD Dosen (Admin) | Tambah/edit/hapus dosen | Data berubah di tabel |
| 6 | Assign Dosen PA | Assign PA ke mahasiswa | Data tersimpan |
| 7 | Search & Filter | Gunakan search dan filter tab | Data terfilter |
| 8 | Profil Mahasiswa | Lihat profil + info Dosen PA | Informasi lengkap |
| 9 | Profil Dosen | Lihat profil + daftar bimbingan | Informasi lengkap |
| 10 | Logout | Klik logout | Kembali ke halaman login |
| 11 | Responsive Mobile | Buka di HP atau resize browser | Tampilan rapi |

---

## 10. Troubleshooting

### 9.1 Error Koneksi Database

**Gejala:** Backend error saat startup, muncul pesan "Can't reach database server"

**Penyebab & Solusi:**
- **Connection string salah** → Periksa kembali `DATABASE_URL` di environment variable Railway
- **IP tidak diizinkan** → Di dashboard Supabase, buka **Database** → **Network Policies** dan pastikan **"Allow all incoming traffic"** aktif
- **Password salah** → Reset password database di Supabase

### 9.2 CORS Error

**Gejala:** Di console browser muncul error "Cross-Origin Request Blocked"

**Penyebab & Solusi:**
- `VITE_API_URL` di Vercel masih mengarah ke `localhost`
- Update `VITE_API_URL` ke URL backend production (`https://sikrs-backend.up.railway.app/api`)
- Redeploy frontend di Vercel

### 9.3 Environment Variable Salah

**Gejala:** Aplikasi tidak berfungsi seperti yang diharapkan

**Solusi:**
- Periksa environment variable di dashboard Railway dan Vercel
- Pastikan nama variable sesuai (case-sensitive)
- Untuk Vite, variable harus diawali dengan `VITE_`
- Setelah mengubah, redeploy aplikasi

### 9.4 API Masih Mengarah ke Localhost

**Gejala:** Frontend mencoba fetch ke `http://localhost:5000`

**Solusi:**
- Periksa file `frontend/.env` jika masih ada file lokal
- Di Vercel, pastikan `VITE_API_URL` sudah diisi dengan URL Railway
- Hapus cache browser atau buka di tab incognito

### 9.5 Build Frontend Gagal

**Gejala:** Vercel gagal saat build

**Solusi:**
- Periksa log build di dashboard Vercel
- Pastikan **Root Directory** sudah diatur ke `frontend`
- Pastikan **Node Version** sesuai (Vercel otomatis menggunakan versi terbaru)

### 9.6 Backend Free Tier Sleep

**Gejala:** Aplikasi lambat saat pertama kali dibuka setelah tidak digunakan

**Penyebab:** Railway free tier memiliki batasan resource

**Solusi:**
- Tunggu 30-60 detik, backend akan bangun dan merespon
- Ini normal untuk free tier, tidak ada yang salah dengan aplikasi
- Jika ingin selalu aktif, upgrade ke paid plan ($7/bulan)

### 9.7 Redis / Caching Gagal

**Gejala:** Data tidak terbarui (stale) atau aplikasi berjalan lambat

**Penyebab & Solusi:**
- **REDIS_URL salah** → Periksa URL Redis di environment variable Railway. Pastikan URL dari Upstash sudah benar
- **Koneksi timeout** → Backend otomatis fallback ke in-memory cache, aplikasi tetap berjalan. Cek log backend di dashboard Railway
- **Cache tidak terhapus** → Jika data diubah langsung di database, cache mungkin masih menyimpan data lama. Klik tombol **Refresh** di halaman admin untuk membersihkan cache
- **Token Redis expired** → Di dashboard Upstash, periksa status database apakah masih aktif

### 9.8 Database Supabase Sleep

**Gejala:** Error database setelah beberapa saat tidak digunakan

**Penyebab:** Supabase free tier juga bisa sleep

**Solusi:**
- Refresh halaman beberapa kali
- Jika error berlanjut, cek status di dashboard Supabase

---

## 11. Analisis Pemilihan PaaS

### 11.1 Mengapa Menggunakan PaaS?

PaaS (Platform as a Service) adalah layanan cloud yang menyediakan platform untuk menjalankan aplikasi tanpa perlu mengurus infrastruktur server. Berikut alasan utama memilih PaaS untuk hosting aplikasi ini:

| Aspek | PaaS (Vercel + Railway + Supabase) | VPS / Server Manual |
|-------|-----------------------------------|---------------------|
| **Setup** | Langsung pakai, 5-10 menit | Butuh setup server, konfigurasi Nginx, SSL, dll (2-3 jam) |
| **Pengetahuan Teknis** | Tidak perlu tahu Linux / terminal | Perlu paham Linux, SSH, command line |
| **Maintenance** | Otomatis oleh platform | Harus update manual,维护 keamanan server |
| **SSL/HTTPS** | Otomatis tersedia | Harus setup sendiri (Certbot, dll) |
| **Skalabilitas** | Otomatis scaling | Harus konfigurasi manual |
| **Biaya** | Gratis (dengan batasan) | Minimal $5-10/bulan untuk VPS |
| **Monitoring** | Dashboard bawaan | Perlu setup tools tambahan |

### 10.2 Kelebihan PaaS untuk Orang Awam

1. **Tidak perlu terminal** — Semua dikelola melalui dashboard web
2. **Deploy otomatis** — Cukup hubungkan ke GitHub, setiap push akan otomatis di-deploy
3. **SSL/HTTPS gratis** — Semua platform menyediakan SSL otomatis
4. **Domain gratis** — Setiap platform memberikan subdomain gratis (`*.up.railway.app`, `*.vercel.app`)
5. **Dokumentasi lengkap** — Setiap platform memiliki panduan dan komunitas yang besar
6. **Free tier** — Cocok untuk tugas kuliah dan prototyping

### 10.3 Kekurangan PaaS yang Dipilih

| Platform | Kekurangan |
|----------|-----------|
| **Railway (Free)** | Server tidur setelah 15 menit tidak digunakan. Aplikasi perlu ~30 detik untuk bangun |
| **Supabase (Free)** | Database maksimal 500 MB. Project bisa di-pause jika tidak aktif |
| **Vercel (Free)** | Build time terbatas (6000 menit/bulan). Bandwidth terbatas untuk team |

### 10.4 Perbandingan Platform per Komponen

**Frontend:**

| Platform | Kelebihan | Kekurangan |
|----------|-----------|------------|
| **Vercel** | Integrasi sempurna dengan Vite. Cepat. Gratis | Tidak bisa host backend |
| **Netlify** | Juga bagus untuk static site | Sedikit lebih lambat dari Vercel |

**Backend:**

| Platform | Kelebihan | Kekurangan |
|----------|-----------|------------|
| **Railway** | Support Node.js, Prisma. Dashboard bagus | Free tier sleep |
| **Railway** | Simple, support banyak bahasa | Free tier lebih terbatas |

**Database:**

| Platform | Kelebihan | Kekurangan |
|----------|-----------|------------|
| **Supabase** | Dashboard lengkap, SQL Editor, gratis 500MB | Project bisa di-pause |
| **Neon** | Serverless, auto-suspend, cepat | Masih relatif baru |
| **Railway PostgreSQL** | Terintegrasi dengan Railway backend | Resource terbatas di free tier |

### 10.5 Alasan Final Pemilihan Platform

| Komponen | Platform Terpilih | Alasan |
|----------|-------------------|--------|
| Frontend | **Vercel** | Integrasi terbaik dengan Vite/React. Build cepat. Gratis. |
| Backend | **Railway** | Support Node.js + Prisma. Build command kustom. Gratis. |
| Database | **Supabase** | Dashboard UI lengkap. SQL Editor untuk import/migrasi. 500MB gratis. |

---

## 12. Checklist Akhir Hosting

Gunakan checklist berikut untuk memastikan semua langkah hosting sudah selesai:

### Persiapan

- [ ] Project sudah diupload ke GitHub
- [ ] Folder `backend/` dan `frontend/` sudah ada di repository
- [ ] File `.env` lokal sudah dibackup (tapi tidak perlu diupload ke GitHub)

### Database (Supabase)

- [ ] Akun Supabase sudah dibuat
- [ ] Project Supabase sudah dibuat
- [ ] Connection string (`DATABASE_URL`) sudah dicopy
- [ ] Tabel database sudah dibuat (via Prisma push atau SQL Editor)
- [ ] Data seed sudah masuk (admin, dosen, prodi, mahasiswa)

### Redis (Upstash)

- [ ] Akun Upstash sudah dibuat
- [ ] Database Redis sudah dibuat
- [ ] `REDIS_URL` sudah dicopy dari dashboard Upstash
- [ ] URL Redis bisa diakses

### Backend (Railway)

- [ ] Akun Railway sudah dibuat
- [ ] Web Service sudah terhubung ke GitHub
- [ ] Root directory diatur ke `backend`
- [ ] Build command sudah diisi
- [ ] Start command sudah diisi
- [ ] Environment variable `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` sudah diisi
- [ ] Deploy berhasil (status "Live")
- [ ] URL backend (`https://sikrs-backend.up.railway.app`) sudah dicatat

### Frontend (Vercel)

- [ ] Akun Vercel sudah dibuat
- [ ] Project sudah terhubung ke GitHub
- [ ] Root directory diatur ke `frontend`
- [ ] Build command dan output directory sudah benar
- [ ] Environment variable `VITE_API_URL` sudah diisi dengan URL backend
- [ ] Deploy berhasil
- [ ] URL frontend (`https://sikrs-frontend.vercel.app`) sudah dicatat

### Testing

- [ ] `https://sikrs-backend.up.railway.app/api/health` mengembalikan `{"status":"ok"}`
- [ ] `https://sikrs-frontend.vercel.app` bisa diakses
- [ ] Login admin berhasil
- [ ] Login mahasiswa berhasil
- [ ] Login dosen berhasil
- [ ] CRUD mahasiswa berfungsi
- [ ] CRUD dosen berfungsi
- [ ] Assign Dosen PA berfungsi
- [ ] Search dan filter berfungsi
- [ ] Profil mahasiswa menampilkan data lengkap
- [ ] Profil dosen menampilkan data lengkap
- [ ] Logout berfungsi
- [ ] Tampilan responsive di HP

---

> **Dokumen ini disusun untuk keperluan tugas kuliah.**
>
> SiKRS — Sistem Informasi Kartu Rencana Studi
>
> Versi 1.0 — 2026
