# SiKRS — Sistem Informasi Kartu Rencana Studi

Aplikasi web untuk mengelola data mahasiswa, dosen, dan dosen pembimbing akademik.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Express.js + Prisma ORM |
| Database | PostgreSQL |
| Cache | Redis (ioredis) |
| Auth | JWT |

## Struktur Project

```
krs-system/
├── backend/          # Express.js API server
│   ├── prisma/       # Database schema + seed
│   └── src/          # Controllers, middleware, routes
├── frontend/         # React + Vite SPA
│   └── src/          # Components, pages, services, context
└── docs/             # Dokumentasi
```

## Cara Menjalankan

### 1. Setup Database

```bash
createdb krs_system
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # sesuaikan konfigurasi database
npx prisma db push
npx prisma db seed
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_URL
npm run dev
```

### 4. Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@krs.com | admin123 |
| Dosen | wayan.sudarsana@unud.ac.id | wayan123 |
| Mahasiswa | negara.2305551057@student.unud.ac.id | 2305551057 |

## Fitur

- Multi-role: Admin, Mahasiswa, Dosen
- CRUD Mahasiswa + Dosen
- Assign Dosen Pembimbing Akademik
- Auto-generate akun user saat input data
- Pencarian & filter data
- Profil pribadi dengan edit email & no HP
- Dashboard admin dengan statistik

## Hosting

Lihat [HOSTING.md](./HOSTING.md) untuk panduan hosting lengkap menggunakan PaaS.
