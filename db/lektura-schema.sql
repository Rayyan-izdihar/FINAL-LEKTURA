-- lektura-schema.sql
-- Jalankan pertama kali pada database PostgreSQL yang masih kosong.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nim VARCHAR(30) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'pegawai', 'mahasiswa')),
    aktif BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    kode VARCHAR(20) NOT NULL UNIQUE,
    deskripsi TEXT
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    isbn VARCHAR(30) NOT NULL UNIQUE,
    penulis VARCHAR(150) NOT NULL,
    penerbit VARCHAR(150) NOT NULL,
    tahun_terbit INTEGER NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    stok_total INTEGER NOT NULL CHECK (stok_total >= 0),
    stok_tersedia INTEGER NOT NULL CHECK (stok_tersedia >= 0 AND stok_tersedia <= stok_total),
    maksimal_pinjam INTEGER NOT NULL DEFAULT 7 CHECK (maksimal_pinjam > 0),
    denda_per_hari NUMERIC(12,2) NOT NULL DEFAULT 1000 CHECK (denda_per_hari >= 0),
    sampul TEXT
);

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    isi TEXT NOT NULL,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('Operasional', 'Layanan', 'Acara')),
    tanggal_rilis DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    author_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    tanggal_pengajuan DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_pinjam DATE,
    tanggal_jatuh_tempo DATE,
    tanggal_kembali DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu Konfirmasi'
        CHECK (status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam', 'Ditolak', 'Selesai')),
    alasan_penolakan TEXT,
    status_perpanjangan VARCHAR(30) NOT NULL DEFAULT 'Tidak Ada'
        CHECK (status_perpanjangan IN ('Tidak Ada', 'Diajukan', 'Disetujui', 'Ditolak')),
    tanggal_pengajuan_perpanjangan DATE,
    alasan_perpanjangan TEXT,
    status_denda VARCHAR(20) NOT NULL DEFAULT 'Tidak Ada'
        CHECK (status_denda IN ('Tidak Ada', 'Tertunggak', 'Lunas')),
    jumlah_denda NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (jumlah_denda >= 0)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL UNIQUE REFERENCES loans(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    ulasan TEXT,
    tanggal_ulasan TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notification Log System: pengingat jatuh tempo, denda baru, dan keputusan pegawai.
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
    tipe VARCHAR(30) NOT NULL CHECK (tipe IN (
        'jatuh_tempo',
        'denda_baru',
        'pinjam_disetujui',
        'pinjam_ditolak',
        'perpanjangan_disetujui',
        'perpanjangan_ditolak'
    )),
    pesan TEXT NOT NULL,
    dibaca BOOLEAN NOT NULL DEFAULT FALSE,
    dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- satu jenis notifikasi hanya boleh muncul sekali per transaksi
    UNIQUE (loan_id, tipe)
);

-- Perpanjangan dan status denda disimpan pada loans agar jumlah tabel tetap sederhana.
-- Denda dihitung saat runtime dari tanggal_jatuh_tempo dan denda_per_hari,
-- lalu nominalnya disimpan di jumlah_denda ketika buku dikembalikan.
-- Perubahan stok saat approve/pengembalian dilakukan secara transaksional di backend.
-- Middleware Next.js tidak memerlukan tabel tersendiri.