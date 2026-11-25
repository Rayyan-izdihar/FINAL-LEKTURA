<p align="center">
  <img src="docs/lektura-banner.svg" alt="LEKTURA — Sistem Informasi Perpustakaan Kampus" width="100%" />
</p>

<h1 align="center">LEKTURA</h1>
<p align="center"><strong>Ruang baca digital untuk mengelola koleksi, sirkulasi, dan layanan perpustakaan kampus.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.6-111827?logo=nextdotjs&logoColor=white" alt="Next.js 16.4.6" />
  <img src="https://img.shields.io/badge/React-19.3.0-149ECA?logo=react&logoColor=white" alt="React 19.3.0" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.3.3" />
  <img src="https://img.shields.io/badge/PostgreSQL-Raw_SQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL Raw SQL" />
</p>

<p align="center">
  <a href="#tentang-lektura">Tentang</a> · <a href="#fitur">Fitur</a> · <a href="#preview">Preview</a> · <a href="#teknologi">Teknologi</a> · <a href="#instalasi">Instalasi</a> · <a href="#akun-demo">Akun Demo</a> · <a href="#pengujian">Pengujian</a> · <a href="#database">Database</a> · <a href="#keamanan">Keamanan</a>
</p>

---

## Tentang LEKTURA

LEKTURA adalah aplikasi sistem informasi perpustakaan kampus yang menyatukan layanan pencarian koleksi, peminjaman, pengembalian, dan pengelolaan perpustakaan dalam satu platform digital.

Aplikasi ini dirancang untuk melayani empat jenis pengguna: Guest, Mahasiswa, Pegawai, dan Admin. Setiap role memiliki akses sesuai kebutuhannya, mulai dari menjelajahi katalog hingga mengelola sirkulasi, data koleksi, akun, dan laporan.

LEKTURA dikembangkan sebagai proyek **Tugas Final Praktikum Pemrograman Web 2026**. Fokus pengembangannya adalah menghadirkan alur layanan perpustakaan yang terintegrasi, mudah digunakan, dan memiliki pencatatan transaksi yang tertata.

## ✨ Fitur

<table>
  <tr>
    <th align="left">Role</th>
    <th align="left">Akses dan aktivitas</th>
  </tr>
  <tr>
    <td><strong>Guest</strong></td>
    <td>Menjelajahi beranda, katalog, detail buku, dan pengumuman yang telah diterbitkan; dapat mendaftar atau login.</td>
  </tr>
  <tr>
    <td><strong>Mahasiswa</strong></td>
    <td>Mengajukan peminjaman, memantau transaksi dan riwayat, mengajukan perpanjangan, membaca notifikasi, serta memberi ulasan setelah transaksi selesai.</td>
  </tr>
  <tr>
    <td><strong>Pegawai</strong></td>
    <td>Mengelola buku, stok, sampul, dan pengumuman; memproses peminjaman, pengembalian, perpanjangan, serta pelunasan denda.</td>
  </tr>
  <tr>
    <td><strong>Admin</strong></td>
    <td>Memantau dashboard dan transaksi, mengelola akun serta kategori, melihat analitik, mengekspor laporan, dan mengakses panel operasional pegawai.</td>
  </tr>
</table>

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Notification Log System</h3>
      Mencatat keputusan peminjaman dan perpanjangan, pengingat jatuh tempo, serta informasi denda. Mahasiswa dapat membaca dan menandai notifikasi.
    </td>
    <td width="50%" valign="top">
      <h3>Export &amp; Analytic Reports</h3>
      Menampilkan ringkasan transaksi, tren, buku populer, kategori, dan denda. Laporan transaksi serta denda dapat diunduh dalam format <code>.xlsx</code> menggunakan ExcelJS.
    </td>
  </tr>
</table>

## 🖼️ Preview

<p align="center">
  <img src="docs/halaman-beranda.png" alt="Beranda LEKTURA" width="49%" />
  <img src="docs/halaman-katalog.png" alt="Katalog buku LEKTURA" width="49%" />
</p>
<p align="center">
  <img src="docs/halaman-penguman.png" alt="Halaman pengumuman" width="49%" />
  <img src="docs/dashboard-mahasiswa.png" alt="Dashboard mahasiswa" width="49%" />
</p>
<p align="center">
  <img src="docs/dashboard-admin.png" alt="Dashboard admin" width="49%" />
  <img src="docs/eksport-analitik.png" alt="Dashboard admin" width="49%" />
</p>

## 🧰 Teknologi

| Bagian | Teknologi | Kegunaan |
|---|---|---|
| Framework | Next.js 16.4.6 · App Router | Routing, halaman, dan Route Handler API |
| UI | React 19.3.0 | Komponen dan interaksi antarmuka |
| Styling | Tailwind CSS 4.3.3 | Utility CSS dan tata letak responsif |
| Database | PostgreSQL | Penyimpanan data aplikasi |
| Koneksi database | `pg` 8.23.1 | Menjalankan query dan transaksi SQL |
| Ekspor | ExcelJS 4.4.0 | Membuat workbook Excel `.xlsx` |
| Password | `bcryptjs` 3.0.3 | Hash dan verifikasi kata sandi |
| Sesi | `jose` 6.2.18 | Membuat dan memverifikasi JWT |
| Ikon | `lucide-react` 1.77.0 | Ikon antarmuka |
| Runtime | Node.js 20.9+ | Menjalankan aplikasi |

**Pendekatan database:** LEKTURA menggunakan raw SQL melalui `pg`, tanpa ORM seperti Prisma atau Sequelize. Query yang menerima input menggunakan parameter SQL.

## 🚀 Instalasi

### Prasyarat

- Node.js **20.9 atau lebih baru** dan npm.

- PostgreSQL yang berjalan secara lokal atau dapat diakses.

- Git.

### 1. Clone repository dan pasang dependensi

```bash
git clone https://github.com/Rayyan-izdihar/FINAL-LEKTURA.git
cd FINAL-LEKTURA
npm install
```

### 2. Buat database dan jalankan skema

```bash
psql -U postgres -c "CREATE DATABASE lektura;"
psql -U postgres -d lektura -f db/lektura-schema.sql
psql -U postgres -d lektura -f db/lektura-seed.sql
```

`lektura-seed.sql` mengisi akun demo dan data contoh. Jalankan setelah skema pada database kosong; jangan menjalankannya berulang kali pada database yang sudah berisi data.

### 3. Atur environment variable

Buat `.env.local` di direktori utama proyek. Lalu, esuaikan nilainya dengan konfigurasi PostgreSQL milikmu:

```env
DATABASE_URL=postgresql://postgres:password_postgres@localhost:5432/lektura
JWT_SECRET=ganti_dengan_secret_acak_yang_panjang
```

Buat secret acak menggunakan Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Ganti `JWT_SECRET` dengan hasil perintah tersebut. Jika password database memuat karakter khusus, lakukan URL-encoding pada password di connection string.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)**. Halaman login tersedia di `/login`.

| Perintah | Fungsi |
|---|---|
| `npm run lint` | Menjalankan ESLint |
| `npm run build` | Membuat production build |
| `npm start` | Menjalankan hasil build production |

## 🔑 Akun Demo

Gunakan akun berikut melalui **[http://localhost:3000/login](http://localhost:3000/login)** setelah menjalankan file seed. Seluruh akun dan password berasal dari `db/lektura-seed.sql`.

| Role | Email | Password | Kondisi / data uji |
|---|---|---|---|
| Admin | `admin@kampus.ac.id` | `Admin123!` | Administrasi dan laporan |
| Pegawai | `pegawai@kampus.ac.id` | `Pegawai123!` | Operasional perpustakaan |
| Mahasiswa — Nadia | `nadia@kampus.ac.id` | `Mhs123!` | Denda berjalan; peminjaman baru diblokir |
| Mahasiswa — Bima | `bima@kampus.ac.id` | `Mhs456!` | Beberapa status transaksi |
| Mahasiswa — Citra | `citra@kampus.ac.id` | `Mhs123!` | Riwayat transaksi dan ulasan |
| Mahasiswa — Dimas | `dimas@kampus.ac.id` | `Mhs123!` | Jatuh tempo H-1; perpanjangan disetujui |
| Mahasiswa — Eka | `eka@kampus.ac.id` | `Mhs123!` | Akun nonaktif; uji penolakan login |
| Mahasiswa — Farhan | `farhan@kampus.ac.id` | `Mhs123!` | Denda tertunggak setelah pengembalian |
| Mahasiswa — Gita | `gita@kampus.ac.id` | `Mhs123!` | Belum memiliki transaksi |

> Akun demo hanya untuk pengujian lokal. Jangan gunakan kredensial ini pada deployment atau data sungguhan.

## 🧪 Skenario Pengujian

Pengujian berikut dilakukan secara manual menggunakan akun demo. Hasil yang diharapkan:

| No. | Skenario | Hasil yang diharapkan |
|---:|---|---|
| 1 | Login dan pembatasan role | Setiap role diarahkan ke dashboard yang sesuai dan tidak dapat membuka halaman role lain. |
| 2 | Login akun nonaktif (Eka) | Login ditolak karena akun dinonaktifkan. |
| 3 | Registrasi mahasiswa | Email kampus `.ac.id` diterima; email tidak sesuai dan data duplikat ditolak. |
| 4 | Katalog dan detail buku | Pencarian, filter kategori, detail, dan informasi stok sesuai data. Buku tanpa stok tidak dapat diajukan. |
| 5 | Pengajuan peminjaman | Pengajuan muncul dengan status **Menunggu Konfirmasi**. |
| 6 | Persetujuan / penolakan pegawai | Status transaksi dan stok diperbarui; mahasiswa menerima notifikasi keputusan. |
| 7 | Perpanjangan | Pegawai dapat menyetujui atau menolak; keputusan tampil pada notifikasi. Jika disetujui, jatuh tempo diperbarui. |
| 8 | Pengembalian dan denda | Pengembalian tepat waktu tidak menghasilkan denda; keterlambatan dihitung dari tarif harian buku. |
| 9 | Pelunasan denda | Status denda menjadi **Lunas** setelah dicatat oleh pegawai. |
| 10 | Notification Log System | Notifikasi keputusan, pengingat jatuh tempo, dan denda tampil; status baca dapat diperbarui. |
| 11 | Analitik dan ekspor | Admin melihat ringkasan dan dapat mengunduh laporan transaksi serta denda `.xlsx`. |
| 12 | Proteksi API | Endpoint privat menolak sesi tanpa autentikasi (**401**) dan role tanpa izin (**403**). |

Status transaksi yang digunakan: `Menunggu Konfirmasi`, `Sedang Dipinjam`, `Ditolak`, dan `Selesai`. Status perpanjangan: `Tidak Ada`, `Diajukan`, `Disetujui`, dan `Ditolak`. Status denda: `Tidak Ada`, `Tertunggak`, dan `Lunas`; label **Berjalan** dihitung ketika pinjaman aktif melewati jatuh tempo.

Belum ada script pengujian otomatis khusus. Gunakan skenario di atas untuk pengujian manual, serta `npm run lint` dan `npm run build` untuk pemeriksaan kode.

## 📁 Struktur Proyek

```text
FINAL-LEKTURA/
├── db/
│   ├── lektura-schema.sql       # Definisi tabel dan constraint
│   └── lektura-seed.sql         # Akun demo dan data awal
├── docs/                       # Banner dan screenshot README
├── public/                     # Logo, ilustrasi, dan sampul statis
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login dan register
│   │   ├── (utama)/             # Beranda, katalog, dashboard, dll.
│   │   ├── actions/             # Server actions autentikasi
│   │   └── api/                 # Route Handler API
│   ├── components/              # Komponen UI per fitur dan role
│   ├── lib/                     # Database, auth, validasi, Excel, dll.
│   └── proxy.js                 # Pemeriksaan akses halaman
├── .env.example
├── package.json
└── README.md
```

## 🗃️ Database dan Relasi

LEKTURA menggunakan delapan tabel utama. Foreign key dan constraint PostgreSQL menjaga hubungan serta konsistensi data.

| Tabel | Fungsi |
|---|---|
| `users` | Akun admin, pegawai, dan mahasiswa; role, NIM, hash password, dan status aktif. |
| `categories` | Kategori dan kode klasifikasi buku. |
| `books` | Informasi buku, kategori, stok, durasi pinjam, tarif denda, dan referensi sampul. |
| `book_covers` | Gambar sampul dalam bentuk `BYTEA`, terhubung satu-ke-satu dengan buku. |
| `announcements` | Pengumuman, kategori, tanggal rilis, status publikasi, dan penulis. |
| `loans` | Pengajuan, riwayat pinjam, perpanjangan, pengembalian, dan informasi denda. |
| `reviews` | Rating dan ulasan untuk transaksi selesai; satu transaksi maksimal satu ulasan. |
| `notifications` | Notifikasi mahasiswa yang terhubung dengan pengguna dan, bila relevan, transaksi. |

```mermaid
erDiagram
    USERS ||--o{ LOANS : mengajukan
    USERS ||--o{ ANNOUNCEMENTS : menulis
    USERS ||--o{ NOTIFICATIONS : menerima
    CATEGORIES ||--o{ BOOKS : mengelompokkan
    BOOKS ||--o{ LOANS : dipinjam
    BOOKS ||--o| BOOK_COVERS : memiliki
    LOANS ||--o| REVIEWS : mendapat
    LOANS ||--o{ NOTIFICATIONS : memicu
```

**Catatan desain:**

- Informasi perpanjangan dan denda disimpan pada `loans`; tidak ada tabel perpanjangan atau denda terpisah.

- Denda berjalan dihitung dari jumlah hari keterlambatan dikalikan `books.denda_per_hari`. Saat buku dikembalikan, nominal denda dicatat pada transaksi.

- `book_covers` menyimpan gambar sebagai `BYTEA`; sampul dapat diakses melalui endpoint `/api/sampul/{id}`.

- `notifications` membatasi kombinasi transaksi dan jenis notifikasi agar jenis notifikasi yang sama tidak tercatat berulang untuk transaksi tersebut.

- Proses yang mengubah beberapa data menggunakan transaksi PostgreSQL agar perubahan tetap konsisten.

## 🔒 Keamanan dan Catatan Implementasi

- Password di-hash menggunakan **bcryptjs** sebelum disimpan.

- Sesi menggunakan JWT bertanda tangan **HS256** dari `jose`, dengan masa berlaku satu hari.

- JWT disimpan dalam cookie `HttpOnly`, `SameSite=Lax`, dan `Secure` ketika aplikasi berjalan di production.

- `src/proxy.js` memeriksa akses halaman privat. Route Handler API juga memeriksa sesi dan role melalui `cekAkses()`.

- Query SQL menggunakan parameter untuk input pengguna; proses multi-perubahan dapat dijalankan dalam transaksi database.

- Akun yang dinonaktifkan tidak dapat login.

### Catatan deployment

- Pengingat jatuh tempo tidak dijalankan oleh cron job. Sistem membuat pengingat ketika mahasiswa membuka bagian aplikasi yang memuat notifikasi. Pengiriman terjadwal tanpa kunjungan pengguna memerlukan scheduler/cron.

- Simpan rahasia di `.env.local`, jangan commit file tersebut, dan gunakan secret serta kredensial database berbeda untuk production.

- Untuk deployment, gunakan HTTPS, kredensial database khusus aplikasi, backup database, dan jangan sertakan data seed/demo.

---

<p align="center"><strong>LEKTURA</strong><br /><sub>Tugas Final Praktikum Pemrograman Web 2026 · Sistem Informasi Perpustakaan Kampus</sub></p>
