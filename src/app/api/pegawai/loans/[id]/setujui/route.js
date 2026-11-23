import { NextResponse } from 'next/server';
import { dalamTransaksi } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif, mahasiswaTerblokir } from '@/lib/peminjaman';
import { buatNotifikasi } from '@/lib/notifikasi';

// POST /api/pegawai/loans/12/setujui
// Pegawai menyetujui pengajuan pinjam saat mahasiswa hadir di meja sirkulasi.
// Status menjadi Sedang Dipinjam, jatuh tempo ditetapkan, dan stok buku berkurang 1.
// Semua langkah ada di satu transaksi: kalau salah satu gagal, tidak ada yang tersimpan.
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
            // FOR UPDATE mengunci baris, supaya dua pegawai tidak memproses transaksi yang sama bersamaan
            const cari = await db.query(
                `SELECT l.id, l.user_id, l.book_id, l.status, b.judul, b.maksimal_pinjam
                 FROM loans l
                 JOIN books b ON b.id = l.book_id
                 WHERE l.id = $1
                 FOR UPDATE OF l`,
                [id]
            );
            const pinjaman = cari.rows[0];

            if (!pinjaman) return { status: 404, pesan: 'Transaksi tidak ditemukan' };
            if (pinjaman.status !== 'Menunggu Konfirmasi') {
                return { status: 409, pesan: 'Transaksi ini sudah diproses' };
            }


            // Kunci baris buku lalu cek stok terbaru (stok bisa berubah sejak pengajuan)
            const buku = await db.query('SELECT stok_tersedia FROM books WHERE id = $1 FOR UPDATE', [
                pinjaman.book_id,
            ]);
            if (buku.rows[0].stok_tersedia <= 0) {
                return { status: 409, pesan: 'Stok buku sedang habis, pengajuan belum bisa disetujui' };
            }

            if (await mahasiswaTerblokir(pinjaman.user_id)) {
                return {
                    status: 409,
                    pesan: 'Mahasiswa ini masih punya denda tertunggak, pengajuan tidak bisa disetujui',
                };
            }


            await db.query(
                `UPDATE loans
                 SET status = 'Sedang Dipinjam',
                     tanggal_pinjam = CURRENT_DATE,
                     tanggal_jatuh_tempo = CURRENT_DATE + $2::int
                 WHERE id = $1`,
                [id, pinjaman.maksimal_pinjam]
            );

            await db.query('UPDATE books SET stok_tersedia = stok_tersedia - 1 WHERE id = $1', [
                pinjaman.book_id,
            ]);

            await buatNotifikasi(
                {
                    userId: pinjaman.user_id,
                    loanId: pinjaman.id,
                    tipe: 'pinjam_disetujui',
                    pesan: `Peminjaman buku "${pinjaman.judul}" telah disetujui. Lama pinjam ${pinjaman.maksimal_pinjam} hari.`,
                },
                db
            );

            return { status: 200, pesan: `Peminjaman "${pinjaman.judul}" disetujui` };
        });

        return NextResponse.json({ pesan: hasil.pesan }, { status: hasil.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}