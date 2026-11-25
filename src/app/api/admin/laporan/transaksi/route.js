import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { kirimXlsx } from '@/lib/excel';
import { formatRupiah } from '@/lib/format';

const KOLOM = [
    ['Nama', 'nama'],
    ['NIM', 'nim'],
    ['Judul buku', 'judul'],
    ['ISBN', 'isbn'],
    ['Kategori', 'kategori'],
    ['Status', 'status'],
    ['Tanggal pengajuan', 'tanggal_pengajuan'],
    ['Tanggal pinjam', 'tanggal_pinjam'],
    ['Jatuh tempo', 'tanggal_jatuh_tempo'],
    ['Tanggal kembali', 'tanggal_kembali'],
    ['Perpanjangan', 'status_perpanjangan'],
    ['Hari terlambat', 'hari_terlambat'],
    ['Denda (Rp)', 'denda'],
    ['Status denda', 'status_denda'],
];

function bacaTanggal(teks) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(teks ?? '')) return null;
    const tanggal = new Date(`${teks}T00:00:00Z`);
    return !Number.isNaN(tanggal.getTime()) && tanggal.toISOString().slice(0, 10) === teks ? teks : null;
}


// GET /api/admin/laporan/transaksi?dari=2026-11-01&sampai=2026-11-30
export async function GET(request) {
    try {
        const { error } = await cekAkses(['admin']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const dari = bacaTanggal(searchParams.get('dari'));
        const sampai = bacaTanggal(searchParams.get('sampai'));

        const hasil = await query(
            `SELECT l.id, u.nama, u.nim, b.judul, b.isbn, c.nama AS kategori,
                    l.status, l.status_perpanjangan, l.status_denda, l.jumlah_denda, b.denda_per_hari,
                    to_char(l.tanggal_pengajuan, 'YYYY-MM-DD') AS tanggal_pengajuan,
                    to_char(l.tanggal_pinjam, 'YYYY-MM-DD') AS tanggal_pinjam,
                    to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS tanggal_jatuh_tempo,
                    to_char(l.tanggal_kembali, 'YYYY-MM-DD') AS tanggal_kembali,
                    CASE
                        WHEN l.status = 'Selesai' THEN GREATEST(l.tanggal_kembali - l.tanggal_jatuh_tempo, 0)
                        WHEN l.status = 'Sedang Dipinjam' THEN GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0)
                        ELSE 0
                    END AS hari_terlambat
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             JOIN categories c ON c.id = b.category_id
             WHERE ($1::date IS NULL OR l.tanggal_pengajuan >= $1::date)
               AND ($2::date IS NULL OR l.tanggal_pengajuan <= $2::date)
             ORDER BY tanggal_pengajuan DESC, u.nama, l.id`,
            [dari, sampai]
        );

        const baris = hasil.rows.map((b) => {
            let denda = 0;
            let statusDenda = b.status_denda;
            if (b.status === 'Selesai') denda = Number(b.jumlah_denda);
            if (b.status === 'Sedang Dipinjam' && b.hari_terlambat > 0) {
                denda = b.hari_terlambat * Number(b.denda_per_hari);
                statusDenda = 'Berjalan';
            }
            return { ...b, denda: formatRupiah(denda), status_denda: statusDenda };
        });

        return kirimXlsx('laporan-transaksi', KOLOM, baris);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}