import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';

// GET /api/admin/laporan
// Angka untuk halaman Laporan admin: ringkasan, tren 6 bulan, buku dan kategori terpopuler, rekap denda.
export async function GET() {
    try {
        const { error } = await cekAkses(['admin']);
        if (error) return error;

        const ringkasan = await query(
            `SELECT COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE status IN ('Sedang Dipinjam', 'Selesai'))::int AS disetujui,
                    COUNT(*) FILTER (WHERE status = 'Selesai')::int AS selesai,
                    COUNT(*) FILTER (WHERE status = 'Selesai' AND tanggal_kembali > tanggal_jatuh_tempo)::int AS selesai_terlambat
             FROM loans`
        );

        // Pengajuan per bulan untuk 6 bulan terakhir; bulan tanpa transaksi tetap muncul dengan jumlah 0
        const bulanan = await query(
            `SELECT to_char(b.bulan, 'YYYY-MM') AS bulan, COUNT(l.id)::int AS jumlah
             FROM (
                 SELECT (date_trunc('month', CURRENT_DATE) - make_interval(months => n))::date AS bulan
                 FROM generate_series(0, 5) AS n
             ) b
             LEFT JOIN loans l ON date_trunc('month', l.tanggal_pengajuan)::date = b.bulan
             GROUP BY b.bulan
             ORDER BY b.bulan`
        );

        const bukuPopuler = await query(
            `SELECT b.judul, COUNT(*)::int AS jumlah
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.status IN ('Sedang Dipinjam', 'Selesai')
             GROUP BY b.id
             ORDER BY jumlah DESC, b.judul
             LIMIT 5`
        );

        const perKategori = await query(
            `SELECT c.nama, COUNT(l.id)::int AS jumlah
             FROM categories c
             LEFT JOIN books b ON b.category_id = c.id
             LEFT JOIN loans l ON l.book_id = b.id AND l.status IN ('Sedang Dipinjam', 'Selesai')
             GROUP BY c.id
             ORDER BY jumlah DESC, c.nama
             LIMIT 6`
        );

        // Tiga jenis denda. Aturannya sama dengan file Excel rekap denda.
        const denda = await query(
            `SELECT 'lunas' AS jenis, COUNT(*)::int AS jumlah, COALESCE(SUM(jumlah_denda), 0) AS nominal
             FROM loans WHERE status_denda = 'Lunas'
             UNION ALL
             SELECT 'tertunggak', COUNT(*)::int, COALESCE(SUM(jumlah_denda), 0)
             FROM loans WHERE status = 'Selesai' AND status_denda = 'Tertunggak'
             UNION ALL
             SELECT 'berjalan', COUNT(*)::int,
                    COALESCE(SUM(GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) * b.denda_per_hari), 0)
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.status = 'Sedang Dipinjam' AND CURRENT_DATE > l.tanggal_jatuh_tempo`
        );
        const rekapDenda = {};
        denda.rows.forEach((b) => {
            rekapDenda[b.jenis] = { jumlah: b.jumlah, nominal: Number(b.nominal) };
        });

        return NextResponse.json({
            ringkasan: ringkasan.rows[0],
            bulanan: bulanan.rows,
            buku_populer: bukuPopuler.rows,
            per_kategori: perKategori.rows,
            denda: rekapDenda,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}