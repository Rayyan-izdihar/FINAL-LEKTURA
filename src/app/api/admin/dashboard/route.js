import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';

// GET /api/admin/dashboard
// Statistik agregat perpustakaan untuk dashboard admin.
export async function GET() {
    try {
        const { sesi, error } = await cekAkses(['admin']);
        if (error) return error;

        // Satu query yang menggabungkan tiga tabel (books, users, loans) lewat subquery agregasi
        const statistik = await query(
            `SELECT
                (SELECT COUNT(*)::int FROM books) AS total_judul,
                (SELECT COALESCE(SUM(stok_total), 0)::int FROM books) AS total_eksemplar,
                (SELECT COUNT(*)::int FROM users WHERE role = 'mahasiswa') AS total_mahasiswa,
                (SELECT COUNT(*)::int FROM loans WHERE status = 'Sedang Dipinjam') AS transaksi_aktif,
                (SELECT COALESCE(SUM(jumlah_denda), 0) FROM loans WHERE status_denda = 'Lunas') AS denda_lunas,
                (SELECT COUNT(*)::int FROM loans WHERE status_denda = 'Tertunggak') AS denda_tertunggak`
        );

        // Jumlah transaksi per status, untuk grafik batang
        const perStatus = await query(
            `SELECT status, COUNT(*)::int AS jumlah
             FROM loans
             GROUP BY status`
        );

        // Enam transaksi terakhir
        const terbaru = await query(
            `SELECT l.id, l.status, u.nama, b.judul,
                    to_char(l.tanggal_pengajuan, 'YYYY-MM-DD') AS tanggal_pengajuan
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             ORDER BY l.id DESC
             LIMIT 6`
        );

        const baris = statistik.rows[0];
        return NextResponse.json({
            nama: sesi.nama,
            statistik: { ...baris, denda_lunas: Number(baris.denda_lunas) },
            per_status: perStatus.rows,
            terbaru: terbaru.rows,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}