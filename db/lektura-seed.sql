-- 02_insert_data.sql
-- Jalankan setelah 01_create_tables.sql.
-- Hash password dibuat dengan bcrypt melalui pgcrypto (kompatibel dengan bcrypt.compare).
-- Password demo:
-- admin@kampus.ac.id   : Admin123!
-- pegawai@kampus.ac.id : Pegawai123!
-- nadia@kampus.ac.id   : Mhs123!
-- bima@kampus.ac.id    : Mhs456!

INSERT INTO users (nama, email, password_hash, nim, role) VALUES
('Administrator', 'admin@kampus.ac.id', crypt('Admin123!', gen_salt('bf', 12)), NULL, 'admin'),
('Petugas Perpustakaan', 'pegawai@kampus.ac.id', crypt('Pegawai123!', gen_salt('bf', 12)), NULL, 'pegawai'),
('Nadia Putri', 'nadia@kampus.ac.id', crypt('Mhs123!', gen_salt('bf', 12)), 'H071251001', 'mahasiswa'),
('Bima Pratama', 'bima@kampus.ac.id', crypt('Mhs456!', gen_salt('bf', 12)), 'H071251002', 'mahasiswa');

INSERT INTO categories (nama, kode, deskripsi) VALUES
('Teknologi Informasi', 'TI', 'Buku komputer dan teknologi'),
('Fiksi', 'FIK', 'Novel dan cerita fiksi'),
('Pengembangan Diri', 'PD', 'Buku pengembangan kemampuan diri'),
('Sains', 'SAI', 'Buku ilmu pengetahuan');

INSERT INTO books
(judul, isbn, penulis, penerbit, tahun_terbit, category_id, stok_total, stok_tersedia, maksimal_pinjam, denda_per_hari, sampul)
VALUES
('Dasar-Dasar Pemrograman Web', '9786020000001', 'Andi Setiawan', 'Informatika', 2023, 1, 5, 4, 7, 1000, NULL),
('Belajar PostgreSQL', '9786020000002', 'Budi Raharjo', 'Media Kita', 2022, 1, 4, 4, 7, 1000, NULL),
('Laskar Pelangi', '9786020000003', 'Andrea Hirata', 'Bentang Pustaka', 2005, 2, 6, 6, 7, 500, NULL),
('Bumi', '9786020000004', 'Tere Liye', 'Gramedia', 2014, 2, 5, 5, 7, 500, NULL),
('Atomic Habits', '9786020000005', 'James Clear', 'Gramedia', 2019, 3, 3, 3, 7, 1000, NULL),
('Pengantar Sains', '9786020000006', 'Dina Maharani', 'Erlangga', 2021, 4, 3, 3, 7, 1000, NULL);

INSERT INTO announcements (judul, isi, kategori, tanggal_rilis, status, author_id) VALUES
('Jam Operasional Perpustakaan', 'Perpustakaan buka Senin sampai Sabtu pukul 09.00-20.00 WITA.', 'Operasional', CURRENT_DATE, 'Published', 2),
('Pengembalian Buku Tepat Waktu', 'Kembalikan buku sebelum tanggal jatuh tempo.', 'Layanan', CURRENT_DATE, 'Published', 2),
('Penambahan Koleksi Buku', 'Perpustakaan menerima koleksi buku baru.', 'Acara', CURRENT_DATE, 'Draft', 1);

INSERT INTO loans
(user_id, book_id, tanggal_pengajuan, tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali, status, status_denda)
VALUES
(3, 1, CURRENT_DATE - 10, CURRENT_DATE - 9, CURRENT_DATE - 2, NULL, 'Sedang Dipinjam', 'Tertunggak'),
(4, 2, CURRENT_DATE - 1, NULL, NULL, NULL, 'Menunggu Konfirmasi', 'Tidak Ada'),
(3, 3, CURRENT_DATE - 20, CURRENT_DATE - 19, CURRENT_DATE - 12, CURRENT_DATE - 13, 'Selesai', 'Tidak Ada'),
(4, 4, CURRENT_DATE - 15, CURRENT_DATE - 14, CURRENT_DATE - 7, CURRENT_DATE - 5, 'Selesai', 'Lunas');

UPDATE loans
SET status_perpanjangan = 'Diajukan',
    tanggal_pengajuan_perpanjangan = CURRENT_DATE,
    alasan_perpanjangan = 'Masih membutuhkan waktu untuk menyelesaikan bacaan.'
WHERE id = 1;

INSERT INTO reviews (loan_id, rating, ulasan) VALUES
(3, 5, 'Buku menarik dan mudah dipahami.'),
(4, 4, 'Isi buku bagus dan bermanfaat.');

-- Contoh menghitung denda keterlambatan saat runtime:
-- SELECT l.id,
--        GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) * b.denda_per_hari AS total_denda
-- FROM loans l JOIN books b ON b.id = l.book_id
-- WHERE l.status = 'Sedang Dipinjam'
--   AND CURRENT_DATE > l.tanggal_jatuh_tempo;
