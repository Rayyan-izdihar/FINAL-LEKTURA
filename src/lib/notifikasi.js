import { query } from '@/lib/db';

// Menyimpan satu notifikasi untuk mahasiswa.
// Jika notifikasi dengan jenis yang sama sudah ada,
// pesan diperbarui dan statusnya dikembalikan menjadi belum dibaca.
//
// Parameter kedua `db` digunakan saat fungsi dipanggil
// di dalam transaksi agar perubahan ikut berhasil atau gagal bersama transaksi.
export async function buatNotifikasi({ userId, loanId, tipe, pesan }, db = { query }) {
    await db.query(
        `INSERT INTO notifications (user_id, loan_id, tipe, pesan)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (loan_id, tipe)
         DO UPDATE SET
             pesan = EXCLUDED.pesan,
             dibaca = FALSE,
             dibuat_pada = CURRENT_TIMESTAMP`,
        [userId, loanId, tipe, pesan]
    );
}