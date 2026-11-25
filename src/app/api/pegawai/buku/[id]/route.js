import { NextResponse } from 'next/server';
import { dalamTransaksi } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { bacaBerkasSampul, simpanSampul } from '@/lib/sampul';
import { validasiBuku } from '@/lib/validasi';

// POST /api/pegawai/buku/5
// Mengubah data buku. ISBN tidak bisa diubah.
// Body berupa FormData. Gambar sampul (kolom `berkas`) hanya diganti kalau ada berkas baru.
// Stok total boleh diubah, tetapi tidak boleh kurang dari jumlah eksemplar yang sedang dipinjam.
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

        const form = await request.formData().catch(() => null);
        if (!form) return NextResponse.json({ pesan: 'Data yang dikirim tidak valid' }, { status: 400 });

        const { data, pesan } = validasiBuku(Object.fromEntries(form), { ubah: true });
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        const { sampul, pesan: pesanSampul } = await bacaBerkasSampul(form.get('berkas'));
        if (pesanSampul) return NextResponse.json({ pesan: pesanSampul }, { status: 400 });


        const hasil = await dalamTransaksi(async (db) => {
            // Kunci baris buku supaya stok tidak berubah oleh proses lain selama pengecekan
            const lama = await db.query('SELECT stok_total, stok_tersedia FROM books WHERE id = $1 FOR UPDATE', [id]);
            if (lama.rows.length === 0) return { status: 404, pesan: 'Buku tidak ditemukan' };

            const kategori = await db.query('SELECT 1 FROM categories WHERE id = $1', [data.category_id]);
            if (kategori.rows.length === 0) return { status: 400, pesan: 'Kategori tidak ditemukan' };

            
            // Eksemplar yang sedang keluar dari rak
            const dipinjam = lama.rows[0].stok_total - lama.rows[0].stok_tersedia;
            if (data.stok_total < dipinjam) {
                return {
                    status: 409,
                    pesan: `Stok total tidak boleh kurang dari ${dipinjam}, jumlah eksemplar yang sedang dipinjam`,
                };
            }

            await db.query(
                `UPDATE books
                 SET judul = $2, penulis = $3, penerbit = $4, tahun_terbit = $5, category_id = $6,
                     stok_total = $7, stok_tersedia = $7 - $11::int,
                     maksimal_pinjam = $8, denda_per_hari = $9, sampul = COALESCE($10, sampul)
                 WHERE id = $1`,
                [
                    id,
                    data.judul,
                    data.penulis,
                    data.penerbit,
                    data.tahun_terbit,
                    data.category_id,
                    data.stok_total,
                    data.maksimal_pinjam,
                    data.denda_per_hari,
                    data.sampul,
                    dipinjam,
                ]
            );
            // Ada gambar baru: simpan ke database dan perbarui alamat sampulnya
            if (sampul) await simpanSampul(db, id, sampul);

            return { status: 200, pesan: `Buku "${data.judul}" diperbarui` };
        });

        return NextResponse.json({ pesan: hasil.pesan }, { status: hasil.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}