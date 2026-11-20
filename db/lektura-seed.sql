-- lektura-seed.sql
-- Jalankan setelah lektura-schema.sql.
-- Hash password sudah berupa bcrypt (cost 10), kompatibel dengan bcrypt.compare di bcryptjs.
-- Password demo:
-- admin@kampus.ac.id   : Admin123!
-- pegawai@kampus.ac.id : Pegawai123!
-- nadia@kampus.ac.id   : Mhs123!   (denda tertunggak, diblokir)
-- bima@kampus.ac.id    : Mhs456!   (banyak status transaksi)
-- citra@kampus.ac.id   : Mhs123!   (akun bersih, bisa meminjam)
-- dimas@kampus.ac.id   : Mhs123!   (jatuh tempo besok, perpanjangan disetujui)
-- eka@kampus.ac.id     : Mhs123!   (AKUN NONAKTIF)
-- farhan@kampus.ac.id  : Mhs123!   (denda tertunggak setelah pengembalian telat)
-- gita@kampus.ac.id    : Mhs123!   (tanpa transaksi)
-- Semua tanggal memakai CURRENT_DATE, jadi data selalu relevan kapan pun dijalankan.

INSERT INTO users 
    (nama, email, password_hash, nim, role) 
VALUES  ('Administrator',        'admin@kampus.ac.id',   '$2b$10$k4Z7vrr.H3q38w37qRd/GOCn7vaiXOgiXBJrr21zSVbQIqyteWLP2', NULL,         'admin'),
        ('Petugas Perpustakaan', 'pegawai@kampus.ac.id', '$2b$10$5gJXuYAGEHw9klAohY.ufuIyPLwbw9X5kUmzP/YhnEmEsD2T4jCl2', NULL,         'pegawai'),
        ('Nadia Putri',          'nadia@kampus.ac.id',   '$2b$10$3/P6p9g1QVvkE8LoQc8Ba.azCkfA1T2B.kGC9qqcojVcXcjhnvgFO', 'H071251001', 'mahasiswa'),  -- denda tertunggak (diblokir) + pengajuan perpanjangan
        ('Bima Pratama',         'bima@kampus.ac.id',    '$2b$10$vFySQeSmoV7EBiKVXYpiO.DzsvQh2KaheFVJuL.uiAN64pfRkrXPG', 'H071251002', 'mahasiswa'),  -- punya banyak status transaksi
        ('Citra Lestari',        'citra@kampus.ac.id',   '$2b$10$ykKs0n.n1uWpS8XL5d6h/Ozvh3xEDAps9xENa9E/LY1P/eWewQix.', 'H071251003', 'mahasiswa'),  -- akun bersih, bisa meminjam; ada ulasan yang belum ditulis
        ('Dimas Aditya',         'dimas@kampus.ac.id',   '$2b$10$O8KZXFPvMGlF4JJZhdjV.OVer9e01jXrbmXDTgNBfae615/eshYSG', 'H071251004', 'mahasiswa'),  -- pinjaman H-1 dan perpanjangan disetujui
        ('Eka Wulandari',        'eka@kampus.ac.id',     '$2b$10$X.UM95z7r4YXKB/q82ztlePChCK4uBaBj8O80Valocl.eSVKSVuHu', 'H071251005', 'mahasiswa'),  -- AKUN NONAKTIF (uji login ditolak)
        ('Farhan Maulana',       'farhan@kampus.ac.id',  '$2b$10$Byc3WHX.Bc5XU8EEOTheqOX72q8CeKyXtJBm4myIq190HS.8hqMMK', 'H071251006', 'mahasiswa'),  -- denda tertunggak setelah pengembalian telat
        ('Gita Permata',         'gita@kampus.ac.id',    '$2b$10$Ugs/FikomGjsgMPsCCEOruqDucrCWuElrJQ/BpEXS5uBVWxKMC4Zm', 'H071251007', 'mahasiswa');  -- tanpa transaksi (bisa dihapus)


INSERT INTO categories 
    (nama, kode, deskripsi) 
VALUES  ('Teknologi Informasi', 'TI',  'Buku komputer dan teknologi'),
        ('Fiksi',               'FIK', 'Novel dan cerita fiksi'),
        ('Pengembangan Diri',   'PD',  'Buku pengembangan kemampuan diri'),
        ('Sains',               'SAI', 'Buku ilmu pengetahuan'),
        ('Hukum',               'HUK', 'Buku hukum dan perundang-undangan'),
        ('Kedokteran',          'KED', 'Buku kedokteran dan kesehatan');


INSERT INTO books 
    (judul, isbn, penulis, penerbit, tahun_terbit, category_id, stok_total, stok_tersedia, maksimal_pinjam, denda_per_hari, sampul) 
VALUES  ('Dasar-Dasar Pemrograman Web',      '9786020000001', 'Andi Setiawan',         'Informatika',     2023, 1, 5, 4, 7,  1000, NULL),
        ('Belajar PostgreSQL',               '9786020000002', 'Budi Raharjo',          'Media Kita',      2022, 1, 4, 4, 7,  1000, NULL),
        ('Laskar Pelangi',                   '9786020000003', 'Andrea Hirata',         'Bentang Pustaka', 2005, 2, 6, 5, 7,  500,  NULL),
        ('Bumi',                             '9786020000004', 'Tere Liye',             'Gramedia',        2014, 2, 5, 4, 7,  500,  NULL),
        ('Atomic Habits',                    '9786020000005', 'James Clear',           'Gramedia',        2019, 3, 3, 2, 7,  1000, NULL),
        ('Pengantar Sains',                  '9786020000006', 'Dina Maharani',         'Erlangga',        2021, 4, 3, 3, 7,  1000, NULL),  -- tanpa riwayat transaksi
        ('Algoritma dan Struktur Data',      '9786020000007', 'Rahmat Hidayat',        'Graha Ilmu',      2020, 1, 4, 4, 14, 1000, NULL),
        ('Hukum Perdata Indonesia',          '9786020000008', 'Sri Wahyuni',           'Sinar Grafika',   2018, 5, 3, 3, 14, 1000, NULL),
        ('Bumi Manusia',                     '9786020000009', 'Pramoedya Ananta Toer', 'Hasta Mitra',     1980, 2, 2, 0, 7,  500,  NULL),  -- STOK HABIS (tombol pinjam nonaktif)
        ('Filosofi Teras',                   '9786020000010', 'Henry Manampiring',     'Kompas',          2018, 3, 3, 3, 7,  1000, NULL),
        ('Fisika Dasar Universitas',         '9786020000011', 'Rina Kusuma',           'Erlangga',        2020, 4, 4, 4, 7,  1000, NULL),
        ('Pengantar Ilmu Hukum',             '9786020000012', 'Dedi Prasetyo',         'Sinar Grafika',   2017, 5, 2, 1, 14, 1000, NULL),  -- stok sisa 1
        ('Rekayasa Perangkat Lunak Praktis', '9786020000013', 'Hendra Wijaya',         'Informatika',     2021, 1, 3, 3, 7,  1000, NULL),
        ('Pemrograman Python untuk Pemula',  '9786020000014', 'Maya Anggraini',        'Elex Media',      2019, 1, 4, 4, 7,  1000, NULL);


INSERT INTO announcements 
    (judul, isi, kategori, tanggal_rilis, status, author_id) 
VALUES  ('Jam Operasional Perpustakaan',  'Perpustakaan buka Senin sampai Sabtu pukul 09.00-20.00 WITA. Layanan sirkulasi ditutup 30 menit sebelum perpustakaan tutup, jadi pastikan peminjaman dan pengembalian dilakukan sebelum waktu tersebut.',                  'Operasional', CURRENT_DATE - 10, 'Published', 2),
        ('Pengembalian Buku Tepat Waktu', 'Kembalikan buku sebelum tanggal jatuh tempo. Keterlambatan dikenakan denda per hari sesuai tarif masing-masing buku, dan mahasiswa dengan denda tertunggak tidak dapat mengajukan peminjaman baru sampai denda dilunasi.', 'Layanan',     CURRENT_DATE - 6,  'Published', 2),
        ('Penambahan Koleksi Buku',       'Perpustakaan akan menerima koleksi buku baru untuk semester genap. Daftar judul masih disusun dan akan diumumkan setelah proses pengadaan selesai.',                                                                       'Acara',       CURRENT_DATE,      'Draft',     1),
        ('Libur Hari Besar Nasional',     'Layanan perpustakaan ditutup pada hari libur nasional. Buku yang jatuh tempo pada hari libur dapat dikembalikan pada hari layanan berikutnya tanpa denda.',                                                                'Operasional', CURRENT_DATE - 3,  'Published', 2),
        ('Aturan Denda Keterlambatan',    'Denda dihitung per hari keterlambatan dan besarnya berbeda untuk setiap buku. Informasi tarif tersedia di halaman detail buku. Pelunasan denda dicatat langsung oleh pegawai di meja sirkulasi.',                          'Layanan',     CURRENT_DATE - 2,  'Published', 1),
        ('Bedah Buku: Atomic Habits',     'Perpustakaan mengundang seluruh mahasiswa untuk mengikuti diskusi bedah buku Atomic Habits. Acara terbuka untuk umum dan peserta dapat meminjam buku langsung di lokasi acara.',                                           'Acara',       CURRENT_DATE - 1,  'Published', 2);


INSERT INTO loans 
    (user_id, book_id, tanggal_pengajuan, tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali, status, status_denda, jumlah_denda) 
VALUES  (3, 1,  CURRENT_DATE - 10, CURRENT_DATE - 9,  CURRENT_DATE - 2,  NULL,              'Sedang Dipinjam',     'Tertunggak', 0),  -- Nadia: SUDAH TELAT 2 hari, diblokir, ada pengajuan perpanjangan
        (4, 2,  CURRENT_DATE - 1,  NULL,              NULL,              NULL,              'Menunggu Konfirmasi', 'Tidak Ada',  0),  -- Bima: antrean verifikasi pegawai
        (3, 3,  CURRENT_DATE - 20, CURRENT_DATE - 19, CURRENT_DATE - 12, CURRENT_DATE - 13, 'Selesai',             'Tidak Ada',  0),  -- Nadia: selesai tepat waktu, sudah diulas
        (4, 4,  CURRENT_DATE - 15, CURRENT_DATE - 14, CURRENT_DATE - 7,  CURRENT_DATE - 5,  'Selesai',             'Lunas',      1000),  -- Bima: telat 2 hari x 500, denda lunas
        (5, 3,  CURRENT_DATE - 40, CURRENT_DATE - 39, CURRENT_DATE - 32, CURRENT_DATE - 33, 'Selesai',             'Tidak Ada',  0),
        (6, 3,  CURRENT_DATE - 35, CURRENT_DATE - 34, CURRENT_DATE - 27, CURRENT_DATE - 25, 'Selesai',             'Lunas',      1000),  -- telat 2 hari x 500, lunas
        (8, 3,  CURRENT_DATE - 30, CURRENT_DATE - 29, CURRENT_DATE - 22, CURRENT_DATE - 24, 'Selesai',             'Tidak Ada',  0),
        (7, 3,  CURRENT_DATE - 45, CURRENT_DATE - 44, CURRENT_DATE - 37, CURRENT_DATE - 38, 'Selesai',             'Tidak Ada',  0),
        (4, 3,  CURRENT_DATE - 8,  CURRENT_DATE - 7,  CURRENT_DATE,      NULL,              'Sedang Dipinjam',     'Tidak Ada',  0),  -- Bima: jatuh tempo hari ini (belum telat)
        (5, 1,  CURRENT_DATE - 25, CURRENT_DATE - 24, CURRENT_DATE - 17, CURRENT_DATE - 18, 'Selesai',             'Tidak Ada',  0),
        (6, 1,  CURRENT_DATE - 22, CURRENT_DATE - 21, CURRENT_DATE - 14, CURRENT_DATE - 12, 'Selesai',             'Lunas',      2000),  -- telat 2 hari x 1000, lunas
        (8, 1,  CURRENT_DATE - 18, CURRENT_DATE - 17, CURRENT_DATE - 10, CURRENT_DATE - 6,  'Selesai',             'Tertunggak', 4000),  -- Farhan: telat 4 hari x 1000, BELUM LUNAS (diblokir)
        (7, 1,  CURRENT_DATE - 50, CURRENT_DATE - 49, CURRENT_DATE - 42, CURRENT_DATE - 43, 'Selesai',             'Tidak Ada',  0),
        (6, 5,  CURRENT_DATE - 7,  CURRENT_DATE - 6,  CURRENT_DATE + 1,  NULL,              'Sedang Dipinjam',     'Tidak Ada',  0),  -- Dimas: jatuh tempo BESOK (H-1), bisa ajukan perpanjangan
        (5, 5,  CURRENT_DATE - 30, CURRENT_DATE - 29, CURRENT_DATE - 22, CURRENT_DATE - 23, 'Selesai',             'Tidak Ada',  0),
        (4, 5,  CURRENT_DATE - 28, CURRENT_DATE - 27, CURRENT_DATE - 20, CURRENT_DATE - 20, 'Selesai',             'Tidak Ada',  0),
        (3, 5,  CURRENT_DATE - 26, CURRENT_DATE - 25, CURRENT_DATE - 18, CURRENT_DATE - 19, 'Selesai',             'Tidak Ada',  0),  -- Nadia: selesai, BELUM diulas (tautan tulis ulasan)
        (6, 4,  CURRENT_DATE - 12, CURRENT_DATE - 11, CURRENT_DATE + 3,  NULL,              'Sedang Dipinjam',     'Tidak Ada',  0),  -- Dimas: perpanjangan DISETUJUI (jatuh tempo sudah bertambah)
        (5, 4,  CURRENT_DATE - 33, CURRENT_DATE - 32, CURRENT_DATE - 25, CURRENT_DATE - 26, 'Selesai',             'Tidak Ada',  0),  -- Citra: selesai, BELUM diulas (tautan tulis ulasan)
        (5, 9,  CURRENT_DATE - 6,  CURRENT_DATE - 5,  CURRENT_DATE + 2,  NULL,              'Sedang Dipinjam',     'Tidak Ada',  0),  -- Citra: perpanjangan DITOLAK
        (4, 9,  CURRENT_DATE - 4,  CURRENT_DATE - 3,  CURRENT_DATE + 4,  NULL,              'Sedang Dipinjam',     'Tidak Ada',  0),  -- Bima: eksemplar terakhir, stok jadi 0
        (5, 13, CURRENT_DATE,      NULL,              NULL,              NULL,              'Menunggu Konfirmasi', 'Tidak Ada',  0),  -- Citra: antrean verifikasi pegawai
        (6, 14, CURRENT_DATE,      NULL,              NULL,              NULL,              'Menunggu Konfirmasi', 'Tidak Ada',  0),  -- Dimas: antrean verifikasi pegawai
        (5, 11, CURRENT_DATE - 3,  NULL,              NULL,              NULL,              'Ditolak',             'Tidak Ada',  0),  -- Citra: ditolak pegawai (ada alasan penolakan)
        (4, 7,  CURRENT_DATE - 20, CURRENT_DATE - 19, CURRENT_DATE - 5,  CURRENT_DATE - 6,  'Selesai',             'Tidak Ada',  0),  -- Bima: buku dengan masa pinjam 14 hari
        (4, 12, CURRENT_DATE - 3,  CURRENT_DATE - 2,  CURRENT_DATE + 12, NULL,              'Sedang Dipinjam',     'Tidak Ada',  0),  -- Bima: masa pinjam 14 hari, stok sisa 1
        (6, 10, CURRENT_DATE - 16, CURRENT_DATE - 15, CURRENT_DATE - 8,  CURRENT_DATE - 9,  'Selesai',             'Tidak Ada',  0);


INSERT INTO reviews 
    (loan_id, rating, ulasan, tanggal_ulasan) 
VALUES  (3,  5, 'Buku menarik dan mudah dipahami.',                                         CURRENT_TIMESTAMP - INTERVAL '12 days'),
        (4,  4, 'Isi buku bagus dan bermanfaat.',                                           CURRENT_TIMESTAMP - INTERVAL '4 days'),
        (5,  4, 'Cerita yang hangat, cocok dibaca di sela jam kuliah.',                     CURRENT_TIMESTAMP - INTERVAL '30 days'),
        (6,  5, 'Salah satu novel favorit saya, sangat menginspirasi.',                     CURRENT_TIMESTAMP - INTERVAL '24 days'),
        (7,  3, 'Ceritanya bagus, tetapi bagian tengah terasa agak lambat.',                CURRENT_TIMESTAMP - INTERVAL '21 days'),
        (8,  4, 'Bahasanya ringan dan mudah diikuti.',                                      CURRENT_TIMESTAMP - INTERVAL '36 days'),
        (10, 5, 'Penjelasan HTML dan CSS-nya runtut, cocok untuk pemula.',                  CURRENT_TIMESTAMP - INTERVAL '16 days'),
        (11, 4, 'Contoh kodenya jelas, tetapi bab JavaScript bisa lebih dalam.',            CURRENT_TIMESTAMP - INTERVAL '11 days'),
        (12, 2, 'Beberapa contoh sudah tidak sesuai dengan versi terbaru.',                 CURRENT_TIMESTAMP - INTERVAL '5 days'),
        (13, 3, 'Cukup membantu sebagai pengantar.',                                        CURRENT_TIMESTAMP - INTERVAL '41 days'),
        (15, 5, 'Mudah dipraktikkan, kebiasaan kecil yang berdampak besar.',                CURRENT_TIMESTAMP - INTERVAL '21 days'),
        (16, 4, 'Ringkas dan praktis.',                                                     CURRENT_TIMESTAMP - INTERVAL '19 days'),
        (25, 4, 'Pembahasan algoritma disertai ilustrasi yang membantu.',                   CURRENT_TIMESTAMP - INTERVAL '5 days'),
        (27, 5, 'Pengantar filsafat yang ringan dan relevan dengan kehidupan sehari-hari.', CURRENT_TIMESTAMP - INTERVAL '8 days');


INSERT INTO notifications 
    (user_id, loan_id, tipe, pesan, dibaca, dibuat_pada) 
VALUES  (3, 1,  'denda_baru',             'Buku "Dasar-Dasar Pemrograman Web" melewati jatuh tempo. Denda mulai dihitung.',                           FALSE, CURRENT_TIMESTAMP - INTERVAL '2 days'),
        (4, 4,  'pinjam_disetujui',       'Peminjaman buku "Bumi" telah disetujui.',                                                                  TRUE,  CURRENT_TIMESTAMP - INTERVAL '14 days'),
        (3, 1,  'jatuh_tempo',            'Buku "Dasar-Dasar Pemrograman Web" jatuh tempo besok.',                                                    TRUE,  CURRENT_TIMESTAMP - INTERVAL '3 days'),
        (6, 14, 'jatuh_tempo',            'Buku "Atomic Habits" jatuh tempo besok. Segera kembalikan atau ajukan perpanjangan.',                      FALSE, CURRENT_TIMESTAMP),
        (6, 18, 'perpanjangan_disetujui', 'Perpanjangan buku "Bumi" disetujui. Masa pinjam bertambah 7 hari.',                                        FALSE, CURRENT_TIMESTAMP - INTERVAL '4 days'),
        (5, 20, 'perpanjangan_ditolak',   'Perpanjangan buku "Bumi Manusia" ditolak. Kembalikan buku sebelum jatuh tempo.',                           FALSE, CURRENT_TIMESTAMP - INTERVAL '1 days'),
        (5, 24, 'pinjam_ditolak',         'Pengajuan buku "Fisika Dasar Universitas" ditolak. Alasan: kartu identitas belum dibawa saat verifikasi.', FALSE, CURRENT_TIMESTAMP - INTERVAL '3 days'),
        (8, 12, 'denda_baru',             'Buku "Dasar-Dasar Pemrograman Web" dikembalikan terlambat 4 hari. Denda Rp 4.000 belum lunas.',            FALSE, CURRENT_TIMESTAMP - INTERVAL '6 days'),
        (4, 21, 'pinjam_disetujui',       'Peminjaman buku "Bumi Manusia" telah disetujui.',                                                          TRUE,  CURRENT_TIMESTAMP - INTERVAL '3 days');


UPDATE loans
SET status_perpanjangan = 'Diajukan',
    tanggal_pengajuan_perpanjangan = CURRENT_DATE,
    alasan_perpanjangan = 'Masih membutuhkan waktu untuk menyelesaikan bacaan.'
WHERE id = 1;

UPDATE loans
SET status_perpanjangan = 'Disetujui',
    tanggal_pengajuan_perpanjangan = CURRENT_DATE - 5,
    alasan_perpanjangan = 'Butuh waktu tambahan untuk menyelesaikan tugas kuliah.'
WHERE id = 18;

UPDATE loans
SET status_perpanjangan = 'Ditolak',
    tanggal_pengajuan_perpanjangan = CURRENT_DATE - 1,
    alasan_perpanjangan = 'Ingin membaca ulang beberapa bab.'
WHERE id = 20;

UPDATE loans
SET alasan_penolakan = 'Kartu identitas belum dibawa saat verifikasi di meja sirkulasi.'
WHERE id = 24;

UPDATE users
SET aktif = FALSE
WHERE email = 'eka@kampus.ac.id';
-- Contoh menghitung denda keterlambatan saat runtime:
-- SELECT l.id,
--        GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) * b.denda_per_hari AS total_denda
-- FROM loans l JOIN books b ON b.id = l.book_id
-- WHERE l.status = 'Sedang Dipinjam'
--   AND CURRENT_DATE > l.tanggal_jatuh_tempo;