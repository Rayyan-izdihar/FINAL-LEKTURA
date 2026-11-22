import { query } from '@/lib/db';

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

// Token login berlaku 1 hari. Fungsi ini memastikan akun belum dinonaktifkan admin
// setelah user login. Dipakai pada aksi yang mengubah data.
export async function akunAktif(userId) {
    const hasil = await query(
        'SELECT aktif FROM users WHERE id = $1', 
        [userId]
    );
    return hasil.rows[0]?.aktif === true;
}