import { NextResponse } from 'next/server';
import { dalamTransaksi } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { buatNotifikasi } from '@/lib/notifikasi';
import { formatTanggal } from '@/lib/format';

// POST /api/pegawai/loans/12/perpanjangan/tolak
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
            const cari = await db.query(
                `SELECT l.id, l.user_id, l.status, l.status_perpanjangan, b.judul,
                        (CURRENT_DATE > l.tanggal_jatuh_tempo) AS lewat_jatuh_tempo
                 FROM loans l
                 JOIN books b ON b.id = l.book_id
                 WHERE l.id = $1
                 FOR UPDATE OF l`,
                [id]
            );
            const lama = cari.rows[0];

            if (!lama) return { status: 404, pesan: 'Transaksi tidak ditemukan' };
            if (lama.status !== 'Sedang Dipinjam' || lama.status_perpanjangan !== 'Diajukan') {
                return { status: 409, pesan: 'Pengajuan perpanjangan ini sudah diproses' };
            }

            // Ditolak setelah jatuh tempo: beri 1 hari tambahan, dihitung dari hari penolakan
            const geserJatuhTempo = lama.lewat_jatuh_tempo ? ', tanggal_jatuh_tempo = CURRENT_DATE + 1' : '';
            const ubah = await db.query(
                `UPDATE loans
                 SET status_perpanjangan = 'Ditolak'${geserJatuhTempo}
                 WHERE id = $1
                 RETURNING to_char(tanggal_jatuh_tempo, 'YYYY-MM-DD') AS jatuh_tempo`,
                [id]
            );
            const jatuhTempo = formatTanggal(ubah.rows[0].jatuh_tempo);

            await buatNotifikasi(
                {
                    userId: lama.user_id,
                    loanId: lama.id,
                    tipe: 'perpanjangan_ditolak',
                    pesan: lama.lewat_jatuh_tempo
                        ? `Perpanjangan buku "${lama.judul}" ditolak. Kamu diberi tambahan 1 hari, kembalikan buku paling lambat ${jatuhTempo}.`
                        : `Perpanjangan buku "${lama.judul}" ditolak. Kembalikan buku sebelum jatuh tempo.`,
                },
                db
            );

            return {
                status: 200,
                pesan: lama.lewat_jatuh_tempo
                    ? `Perpanjangan "${lama.judul}" ditolak, mahasiswa diberi waktu sampai ${jatuhTempo}`
                    : `Perpanjangan "${lama.judul}" ditolak`,
            };
        });

        return NextResponse.json({ pesan: hasil.pesan }, { status: hasil.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}