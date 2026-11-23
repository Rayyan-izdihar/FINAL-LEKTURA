import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { polaCari } from '@/lib/pencarian';

// GET /api/pegawai/sirkulasi?q=kata
// Pinjaman yang sedang berjalan, untuk meja pengembalian.
// Kata kunci dicocokkan dengan nama mahasiswa, NIM, atau judul buku.
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
            `SELECT l.id, u.nama, u.nim, b.id AS book_id, b.judul, b.sampul, b.denda_per_hari,
                    l.status_perpanjangan,
                    to_char(l.tanggal_pinjam, 'YYYY-MM-DD') AS tanggal_pinjam,
                    to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS tanggal_jatuh_tempo,
                    l.tanggal_jatuh_tempo - CURRENT_DATE AS sisa_hari,
                    GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) AS hari_terlambat
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE l.status = 'Sedang Dipinjam' ${syaratCari}
             ORDER BY l.tanggal_jatuh_tempo ASC, l.id ASC`,
            nilai
        );

        
        // Denda berjalan = hari terlambat x tarif per hari buku itu
        const pinjaman = hasil.rows.map((baris) => {
            const tarif = Number(baris.denda_per_hari);
            return { ...baris, denda_per_hari: tarif, denda: baris.hari_terlambat * tarif };
        });

        return NextResponse.json({ pinjaman });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}