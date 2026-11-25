import { query } from '@/lib/db';

// Membuat notifikasi pengingat H-1 (jatuh tempo besok) untuk satu mahasiswa.
//
// Aplikasi ini tidak punya penjadwal yang berjalan sendiri (cron), jadi pengingat dibuat
// saat mahasiswa membuka halaman yang menampilkan notifikasi. Hasilnya sama untuk pengguna:
// notifikasi sudah ada begitu ia datang. UNIQUE (loan_id, tipe) di tabel notifications
// memastikan satu pinjaman hanya mendapat satu pengingat, walau fungsi ini dipanggil berkali-kali
// (ON CONFLICT DO NOTHING membuat duplikat dilewati tanpa error).
export async function buatPengingatJatuhTempo(userId) {
    await query(
        `INSERT INTO notifications (user_id, loan_id, tipe, pesan)
         SELECT l.user_id, l.id, 'jatuh_tempo',
                'Buku "' || b.judul || '" jatuh tempo besok. Segera kembalikan atau ajukan perpanjangan.'
         FROM loans l
         JOIN books b ON b.id = l.book_id
         WHERE l.user_id = $1
           AND l.status = 'Sedang Dipinjam'
           AND l.tanggal_jatuh_tempo = CURRENT_DATE + 1
         ON CONFLICT (loan_id, tipe) DO NOTHING`,
        [userId]
    );
}