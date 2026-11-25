import { NextResponse } from 'next/server';
import { dalamTransaksi } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { buatNotifikasi } from '@/lib/notifikasi';
import { formatRupiah } from '@/lib/format';

// POST /api/pegawai/loans/12/kembali
// Body JSON: { "lunas": true } (opsional, dipakai kalau denda dibayar saat itu juga)
// Pegawai mengonfirmasi buku fisik sudah dikembalikan. Server menghitung denda dari tanggal,
// mengubah status menjadi Selesai, dan menambah stok buku 1, semuanya dalam satu transaksi.
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
        const bayarSekarang = body?.lunas === true;


        const hasil = await dalamTransaksi(async (db) => {
            const cari = await db.query(
                `SELECT l.id, l.user_id, l.book_id, l.status, b.judul, b.denda_per_hari,
                        GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) AS hari_terlambat
                 FROM loans l
                 JOIN books b ON b.id = l.book_id
                 WHERE l.id = $1
                 FOR UPDATE OF l`,
                [id]
            );
            const pinjaman = cari.rows[0];
            
            if (!pinjaman) return { status: 404, pesan: 'Transaksi tidak ditemukan' };
            if (pinjaman.status !== 'Sedang Dipinjam') {
                return { status: 409, pesan: 'Buku ini tidak sedang dipinjam' };
            }

            // Denda dihitung di server dari tanggal, bukan dari angka kiriman browser
            const denda = pinjaman.hari_terlambat * Number(pinjaman.denda_per_hari);
            let statusDenda = 'Tidak Ada';
            if (denda > 0) statusDenda = bayarSekarang ? 'Lunas' : 'Tertunggak';


            await db.query(
                `UPDATE loans
                 SET status = 'Selesai',
                     tanggal_kembali = CURRENT_DATE,
                     jumlah_denda = $2,
                     status_denda = $3
                 WHERE id = $1`,
                [id, denda, statusDenda]
            );

            await db.query('UPDATE books SET stok_tersedia = stok_tersedia + 1 WHERE id = $1', [
                pinjaman.book_id,
            ]);

            if (denda > 0) {
                await buatNotifikasi(
                    {
                        userId: pinjaman.user_id,
                        loanId: pinjaman.id,
                        tipe: 'denda_baru',
                        pesan: `Buku "${pinjaman.judul}" telah dikembalikan setelah melewati tanggal jatuh tempo. ${bayarSekarang ? 'Denda keterlambatan telah dilunasi.' : 'Denda keterlambatan masih menunggu pelunasan.'}`,
                    },
                    db
                );
            }


            let pesan = `Pengembalian "${pinjaman.judul}" dicatat`;
            if (denda > 0) {
                pesan += `. Denda ${formatRupiah(denda)} ${bayarSekarang ? 'dicatat lunas' : 'tercatat tertunggak'}`;
            }
            
            return { status: 200, pesan };
        });

        return NextResponse.json({ pesan: hasil.pesan }, { status: hasil.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}