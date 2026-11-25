import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { polaCari } from '@/lib/pencarian';
import { DAFTAR_STATUS } from '@/lib/statusTransaksi';

// GET /api/admin/transaksi?status=Selesai&q=kata&page=1&limit=10
// Seluruh log transaksi perpustakaan untuk monitoring admin.
export async function GET(request) {
    try {
        const { error } = await cekAkses(['admin']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') ?? '';
        const q = searchParams.get('q') ?? '';
        const halamanDiminta = Math.max(parseInt(searchParams.get('page')) || 1, 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 10, 1), 50);

        const syarat = [];
        const nilai = [];
        if (DAFTAR_STATUS.includes(status)) {
            nilai.push(status);
            syarat.push(`l.status = $${nilai.length}`);
        }
        if (q.trim()) {
            nilai.push(polaCari(q));
            syarat.push(
                `(u.nama ILIKE $${nilai.length} OR u.nim ILIKE $${nilai.length} OR b.judul ILIKE $${nilai.length})`
            );
        }
        const where = syarat.length > 0 ? `WHERE ${syarat.join(' AND ')}` : '';

        const hitung = await query(
            `SELECT COUNT(*)::int AS total
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             ${where}`,
            nilai
        );
        const total = hitung.rows[0].total;
        const totalHalaman = Math.max(Math.ceil(total / limit), 1);
        const halaman = Math.min(halamanDiminta, totalHalaman);

        const hasil = await query(
            `SELECT l.id, u.nama, u.nim, b.judul, b.denda_per_hari,
                    l.status, l.status_perpanjangan, l.status_denda, l.jumlah_denda,
                    to_char(l.tanggal_pengajuan, 'YYYY-MM-DD') AS tanggal_pengajuan,
                    to_char(l.tanggal_pinjam, 'YYYY-MM-DD') AS tanggal_pinjam,
                    to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS tanggal_jatuh_tempo,
                    to_char(l.tanggal_kembali, 'YYYY-MM-DD') AS tanggal_kembali,
                    CASE
                        WHEN l.status = 'Sedang Dipinjam'
                            THEN GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0)
                        ELSE 0
                    END AS hari_terlambat
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             ${where}
             ORDER BY l.id DESC
             LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
            [...nilai, limit, (halaman - 1) * limit]
        );

        // Denda: pinjaman selesai memakai nominal tersimpan, pinjaman aktif dihitung berjalan
        const transaksi = hasil.rows.map((baris) => {
            const tarif = Number(baris.denda_per_hari);
            let denda = 0;
            if (baris.status === 'Selesai') denda = Number(baris.jumlah_denda);
            if (baris.status === 'Sedang Dipinjam') denda = baris.hari_terlambat * tarif;
            return { ...baris, denda_per_hari: tarif, denda };
        });

        // Jumlah per status (tidak terpengaruh filter) untuk angka di tombol filter
        const perStatus = await query('SELECT status, COUNT(*)::int AS jumlah FROM loans GROUP BY status');
        const jumlahPerStatus = {};
        DAFTAR_STATUS.forEach((s) => {
            jumlahPerStatus[s] = 0;
        });
        perStatus.rows.forEach((baris) => {
            jumlahPerStatus[baris.status] = baris.jumlah;
        });

        return NextResponse.json({
            transaksi,
            jumlah_per_status: jumlahPerStatus,
            pagination: { halaman, limit, total, totalHalaman },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}