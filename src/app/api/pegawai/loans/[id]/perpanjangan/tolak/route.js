import { NextResponse } from 'next/server';
import { dalamTransaksi } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { buatNotifikasi } from '@/lib/notifikasi';

// POST /api/pegawai/loans/12/perpanjangan/tolak
// Status perpanjangan menjadi Ditolak. Jatuh tempo tidak berubah.
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

        const hasil = await dalamTransaksi(async (db) => {
            const ubah = await db.query(
                `UPDATE loans l
                 SET status_perpanjangan = 'Ditolak'
                 FROM books b
                 WHERE l.id = $1
                   AND b.id = l.book_id
                   AND l.status = 'Sedang Dipinjam'
                   AND l.status_perpanjangan = 'Diajukan'
                 RETURNING l.id, l.user_id, b.judul`,
                [id]
            );

            if (ubah.rows.length === 0) {
                const ada = await db.query('SELECT 1 FROM loans WHERE id = $1', [id]);
                return ada.rows.length === 0
                    ? { status: 404, pesan: 'Transaksi tidak ditemukan' }
                    : { status: 409, pesan: 'Pengajuan perpanjangan ini sudah diproses' };
            }

            const baris = ubah.rows[0];
            await buatNotifikasi(
                {
                    userId: baris.user_id,
                    loanId: baris.id,
                    tipe: 'perpanjangan_ditolak',
                    pesan: `Perpanjangan buku "${baris.judul}" ditolak. Kembalikan buku sebelum jatuh tempo.`,
                },
                db
            );
            
            return { status: 200, pesan: `Perpanjangan "${baris.judul}" ditolak` };
        });

        return NextResponse.json({ pesan: hasil.pesan }, { status: hasil.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}