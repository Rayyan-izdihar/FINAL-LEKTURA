import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';

// POST /api/admin/users/7/hapus
// Menghapus akun selain akun admin yang sedang login.
// Ditolak kalau akun masih punya transaksi aktif atau punya riwayat yang harus tetap tersimpan.
export async function POST(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['admin']);
        if (error) return error;
        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }

        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Akun tidak ditemukan' }, { status: 404 });
        }
        if (Number(id) === sesi.id) {
            return NextResponse.json({ pesan: 'Kamu tidak dapat menghapus akunmu sendiri' }, { status: 409 });
        }

        const aktif = await query(
            `SELECT 1 FROM loans
             WHERE user_id = $1 AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
             LIMIT 1`,
            [id]
        );
        if (aktif.rows.length > 0) {
            return NextResponse.json(
                { pesan: 'Akun tidak dapat dihapus karena masih punya transaksi aktif' },
                { status: 409 }
            );
        }

        const hasil = await query('DELETE FROM users WHERE id = $1 RETURNING nama', [id]);
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Akun tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: `Akun ${hasil.rows[0].nama} dihapus` });
    } catch (error) {
        // 23503 = data masih dipakai tabel lain (riwayat transaksi atau pengumuman)
        if (error.code === '23503') {
            return NextResponse.json(
                {
                    pesan: 'Akun punya riwayat transaksi atau pengumuman sehingga tidak dapat dihapus. Nonaktifkan lewat menu Ubah.',
                },
                { status: 409 }
            );
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}