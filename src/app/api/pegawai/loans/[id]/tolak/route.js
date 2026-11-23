import { NextResponse } from 'next/server';
import { dalamTransaksi } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { buatNotifikasi } from '@/lib/notifikasi';

// POST /api/pegawai/loans/12/tolak
// Body JSON: { "alasan": "..." } (wajib diisi)
// Pegawai menolak pengajuan pinjam. Stok tidak berubah karena belum pernah dikurangi.
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

        const body = await request.json().catch(() => null);
        const alasan = (body?.alasan ?? '').toString().trim().slice(0, 200);
        if (alasan.length < 3) {
            return NextResponse.json({ pesan: 'Alasan penolakan wajib diisi' }, { status: 400 });
        }

        const hasil = await dalamTransaksi(async (db) => {
            const ubah = await db.query(
                `UPDATE loans l
                 SET status = 'Ditolak', alasan_penolakan = $2
                 FROM books b
                 WHERE l.id = $1 AND b.id = l.book_id AND l.status = 'Menunggu Konfirmasi'
                 RETURNING l.id, l.user_id, b.judul`,
                [id, alasan]
            );

            if (ubah.rows.length === 0) {
                const ada = await db.query('SELECT 1 FROM loans WHERE id = $1', [id]);
                return ada.rows.length === 0
                    ? { status: 404, pesan: 'Transaksi tidak ditemukan' }
                    : { status: 409, pesan: 'Transaksi ini sudah diproses' };
            }

            const baris = ubah.rows[0];
            await buatNotifikasi(
                {
                    userId: baris.user_id,
                    loanId: baris.id,
                    tipe: 'pinjam_ditolak',
                    pesan: `Pengajuan buku "${baris.judul}" ditolak. Alasan: ${alasan}`,
                },
                db
            );
            
            return { status: 200, pesan: `Pengajuan "${baris.judul}" ditolak` };
        });

        return NextResponse.json({ pesan: hasil.pesan }, { status: hasil.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}