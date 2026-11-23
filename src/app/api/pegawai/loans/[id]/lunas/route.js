import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';

// POST /api/pegawai/loans/12/lunas
// Pegawai mencatat denda dari Tertunggak menjadi Lunas.
// Hanya bisa setelah buku dikembalikan, karena sebelum itu nominal denda masih bertambah tiap hari.
export async function POST(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }


        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Transaksi tidak ditemukan' }, { status: 404 });
        }


        const hasil = await query(
            `UPDATE loans
             SET status_denda = 'Lunas'
             WHERE id = $1 AND status = 'Selesai' AND status_denda = 'Tertunggak'
             RETURNING id`,
            [id]
        );

        if (hasil.rows.length === 0) {
            const ada = await query('SELECT status, status_denda FROM loans WHERE id = $1', [id]);
            const baris = ada.rows[0];
            if (!baris) {
                return NextResponse.json({ pesan: 'Transaksi tidak ditemukan' }, { status: 404 });
            }
            if (baris.status === 'Sedang Dipinjam') {
                return NextResponse.json(
                    { pesan: 'Proses pengembalian buku terlebih dahulu sebelum mencatat pelunasan' },
                    { status: 409 }
                );
            }
            
            return NextResponse.json(
                { pesan: 'Transaksi ini tidak memiliki denda tertunggak' },
                { status: 409 }
            );
        }

        return NextResponse.json({ pesan: 'Pelunasan denda dicatat' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}