import { NextResponse } from 'next/server';
import { dalamTransaksi } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { buatNotifikasi } from '@/lib/notifikasi';
import { formatTanggal } from '@/lib/format';

// POST /api/pegawai/loans/12/perpanjangan/setujui
// Status perpanjangan menjadi Disetujui dan jatuh tempo bertambah otomatis sebesar
// lama pinjam buku itu. Tidak bisa disetujui kalau pinjamannya sudah lewat jatuh tempo.
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
                 SET status_perpanjangan = 'Disetujui',
                     tanggal_jatuh_tempo = l.tanggal_jatuh_tempo + b.maksimal_pinjam
                 FROM books b
                 WHERE l.id = $1
                   AND b.id = l.book_id
                   AND l.status = 'Sedang Dipinjam'
                   AND l.status_perpanjangan = 'Diajukan'
                   AND CURRENT_DATE <= l.tanggal_jatuh_tempo
                 RETURNING l.id, l.user_id, b.judul,
                           to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS jatuh_tempo_baru`,
                [id]
            );

            if (ubah.rows.length === 0) {
                const cari = await db.query(
                    `SELECT l.status, l.status_perpanjangan,
                            (CURRENT_DATE > l.tanggal_jatuh_tempo) AS terlambat
                     FROM loans l WHERE l.id = $1`,
                    [id]
                );
                const baris = cari.rows[0];

                if (!baris) return { status: 404, pesan: 'Transaksi tidak ditemukan' };
                if (baris.status === 'Sedang Dipinjam' && baris.status_perpanjangan === 'Diajukan' && baris.terlambat) {
                    return {
                        status: 409,
                        pesan: 'Pinjaman sudah lewat jatuh tempo, perpanjangan tidak bisa disetujui. Tolak pengajuan atau proses pengembalian.',
                    };
                }

                return { status: 409, pesan: 'Pengajuan perpanjangan ini sudah diproses' };
            }


            const baris = ubah.rows[0];
            await buatNotifikasi(
                {
                    userId: baris.user_id,
                    loanId: baris.id,
                    tipe: 'perpanjangan_disetujui',
                    pesan: `Perpanjangan buku "${baris.judul}" disetujui. Jatuh tempo baru ${formatTanggal(baris.jatuh_tempo_baru)}.`,
                },
                db
            );
            
            return {
                status: 200,
                pesan: `Perpanjangan "${baris.judul}" disetujui, jatuh tempo baru ${formatTanggal(baris.jatuh_tempo_baru)}`,
            };
        });

        return NextResponse.json({ pesan: hasil.pesan }, { status: hasil.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}