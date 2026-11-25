import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { polaCari } from '@/lib/pencarian';

// GET /api/pegawai/denda?q=kata
export async function GET(request) {
    try {
        const { error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q') ?? '';

        const nilai = [];
        let syaratCari = '';
        if (q.trim()) {
            nilai.push(polaCari(q));
            syaratCari = 'AND (u.nama ILIKE $1 OR u.nim ILIKE $1 OR b.judul ILIKE $1)';
        }


        const hasil = await query(
            `SELECT l.id, l.status, u.nama, u.nim, b.judul, b.sampul, b.denda_per_hari, l.jumlah_denda,
                    to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS tanggal_jatuh_tempo,
                    to_char(l.tanggal_kembali, 'YYYY-MM-DD') AS tanggal_kembali,
                    CASE
                        WHEN l.status = 'Sedang Dipinjam'
                            THEN GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0)
                        ELSE GREATEST(l.tanggal_kembali - l.tanggal_jatuh_tempo, 0)
                    END AS hari_terlambat
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE (l.status_denda = 'Tertunggak'
                    OR (l.status = 'Sedang Dipinjam' AND CURRENT_DATE > l.tanggal_jatuh_tempo))
                   ${syaratCari}
             ORDER BY (l.status = 'Selesai') DESC, l.tanggal_jatuh_tempo ASC, l.id ASC`,
            nilai
        );


        // Buku yang sudah kembali: nominal tersimpan. Yang belum kembali: masih dihitung berjalan.
        const denda = hasil.rows.map((baris) => {
            const tarif = Number(baris.denda_per_hari);
            const nominal =
                baris.status === 'Selesai' ? Number(baris.jumlah_denda) : baris.hari_terlambat * tarif;
            return { ...baris, denda_per_hari: tarif, nominal };
        });

        return NextResponse.json({ denda });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}