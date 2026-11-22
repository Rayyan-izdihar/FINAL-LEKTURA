import { query } from '@/lib/db';

// Mencatat satu notifikasi untuk mahasiswa (tabel notifications).
// Satu jenis notifikasi hanya boleh muncul sekali per transaksi (UNIQUE loan_id + tipe),
// jadi kalau sudah ada, ON CONFLICT DO NOTHING membuatnya dilewati tanpa error.
//
// Parameter kedua `db` dipakai saat dipanggil di dalam transaksi:
//     await dalamTransaksi(async (db) => {
//         ...
//         await buatNotifikasi({ ... }, db);   // ikut berhasil/gagal bersama transaksi
//     });
// Di luar transaksi cukup: await buatNotifikasi({ ... });
export async function buatNotifikasi({ userId, loanId, tipe, pesan }, db = { query }) {
    await db.query(
        `INSERT INTO notifications (user_id, loan_id, tipe, pesan)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (loan_id, tipe) DO NOTHING`,
        [userId, loanId, tipe, pesan]
    );
}