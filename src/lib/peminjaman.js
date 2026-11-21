import { query } from '@/lib/db';

// Aturan blokir peminjaman, dipakai bersama oleh halaman detail buku (untuk menonaktifkan tombol)
// dan oleh API pengajuan pinjam (untuk menolak pengajuan).
// Mahasiswa dianggap terblokir kalau:
//   1. punya transaksi dengan status denda 'Tertunggak', atau
//   2. punya pinjaman aktif yang sudah lewat jatuh tempo (denda sedang berjalan).
export async function mahasiswaTerblokir(userId) {
    const hasil = await query(
        `SELECT 1
        FROM loans
        WHERE user_id = $1
        AND (status_denda = 'Tertunggak'
                OR (status = 'Sedang Dipinjam' AND CURRENT_DATE > tanggal_jatuh_tempo))
        LIMIT 1`,
        [userId]
    );
    return hasil.rows.length > 0;
}