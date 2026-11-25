import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { kirimXlsx } from '@/lib/excel';

const KOLOM = [
    ['ID transaksi', 'id'],
    ['Nama', 'nama'],
    ['NIM', 'nim'],
    ['Judul buku', 'judul'],
    ['Jatuh tempo', 'tanggal_jatuh_tempo'],
    ['Tanggal kembali', 'tanggal_kembali'],
    ['Hari terlambat', 'hari_terlambat'],
    ['Denda per hari (Rp)', 'denda_per_hari'],
    ['Total denda (Rp)', 'denda'],
    ['Status denda', 'status_denda'],
];

function bacaTanggal(teks) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(teks ?? '')) return null;
    const tanggal = new Date(`${teks}T00:00:00Z`);
    return !Number.isNaN(tanggal.getTime()) && tanggal.toISOString().slice(0, 10) === teks ? teks : null;
}


// GET /api/admin/laporan/denda?dari=2026-11-01&sampai=2026-11-30
export async function GET(request) {
    try {
        const { error } = await cekAkses(['admin']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const dari = bacaTanggal(searchParams.get('dari'));
        const sampai = bacaTanggal(searchParams.get('sampai'));

        const hasil = await query(
            `SELECT l.id, u.nama, u.nim, b.judul, l.status, l.status_denda, l.jumlah_denda, b.denda_per_hari,
                    to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS tanggal_jatuh_tempo,
                    to_char(l.tanggal_kembali, 'YYYY-MM-DD') AS tanggal_kembali,
                    CASE
                        WHEN l.status = 'Selesai' THEN GREATEST(l.tanggal_kembali - l.tanggal_jatuh_tempo, 0)
                        ELSE GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0)
                    END AS hari_terlambat
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE (l.status_denda <> 'Tidak Ada'
                    OR (l.status = 'Sedang Dipinjam' AND CURRENT_DATE > l.tanggal_jatuh_tempo))
               AND ($1::date IS NULL OR l.tanggal_pengajuan >= $1::date)
               AND ($2::date IS NULL OR l.tanggal_pengajuan <= $2::date)
             ORDER BY l.id`,
            [dari, sampai]
        );

        const baris = hasil.rows.map((b) => {
            const tarif = Number(b.denda_per_hari);
            if (b.status === 'Sedang Dipinjam') {
                return { ...b, denda_per_hari: tarif, denda: b.hari_terlambat * tarif, status_denda: 'Berjalan' };
            }
            return { ...b, denda_per_hari: tarif, denda: Number(b.jumlah_denda) };
        });

        return kirimXlsx('laporan-denda', KOLOM, baris);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}