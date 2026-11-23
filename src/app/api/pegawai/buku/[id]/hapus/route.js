import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';

// POST /api/pegawai/buku/5/hapus
// Menghapus buku. Ditolak kalau bukunya sedang dipinjam atau punya pengajuan yang masih berjalan.
export async function POST(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }


        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Buku tidak ditemukan' }, { status: 404 });
        }

        const aktif = await query(
            `SELECT 1 FROM loans
             WHERE book_id = $1 AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
             LIMIT 1`,
            [id]
        );
        if (aktif.rows.length > 0) {
            return NextResponse.json(
                { pesan: 'Buku tidak dapat dihapus karena sedang dipinjam atau punya pengajuan yang masih berjalan' },
                { status: 409 }
            );
        }

        
        const hasil = await query('DELETE FROM books WHERE id = $1 RETURNING judul', [id]);
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Buku tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: `Buku "${hasil.rows[0].judul}" dihapus` });
    } catch (error) {
        // 23503 = kode PostgreSQL untuk data yang masih dipakai tabel lain (foreign key).
        // Di sini artinya buku punya riwayat transaksi, yang harus tetap tersimpan.
        if (error.code === '23503') {
            return NextResponse.json(
                { pesan: 'Buku tidak dapat dihapus karena punya riwayat transaksi' },
                { status: 409 }
            );
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}