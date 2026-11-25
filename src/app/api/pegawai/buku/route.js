import { NextResponse } from 'next/server';
import { dalamTransaksi, query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { bacaBerkasSampul, simpanSampul } from '@/lib/sampul';
import { validasiBuku } from '@/lib/validasi';

// POST /api/pegawai/buku
// Menambah buku baru. Body berupa FormData: isian formulir buku + berkas gambar sampul (kolom `berkas`, boleh kosong).
// Stok tersedia otomatis sama dengan stok total, karena buku baru belum dipinjam.
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }


        const form = await request.formData().catch(() => null);
        if (!form) return NextResponse.json({ pesan: 'Data yang dikirim tidak valid' }, { status: 400 });

        const { data, pesan } = validasiBuku(Object.fromEntries(form));
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        const { sampul, pesan: pesanSampul } = await bacaBerkasSampul(form.get('berkas'));
        if (pesanSampul) return NextResponse.json({ pesan: pesanSampul }, { status: 400 });


        const kategori = await query('SELECT 1 FROM categories WHERE id = $1', [data.category_id]);
        if (kategori.rows.length === 0) {
            return NextResponse.json({ pesan: 'Kategori tidak ditemukan' }, { status: 400 });
        }

        // Buku dan gambar sampulnya disimpan bersamaan: kalau salah satu gagal, keduanya dibatalkan
        const id = await dalamTransaksi(async (db) => {
            const hasil = await db.query(
                `INSERT INTO books
                    (judul, isbn, penulis, penerbit, tahun_terbit, category_id,
                     stok_total, stok_tersedia, maksimal_pinjam, denda_per_hari, sampul)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10)
                 RETURNING id`,
                [
                    data.judul,
                    data.isbn,
                    data.penulis,
                    data.penerbit,
                    data.tahun_terbit,
                    data.category_id,
                    data.stok_total,
                    data.maksimal_pinjam,
                    data.denda_per_hari,
                    data.sampul,
                ]
            );

            const bukuId = hasil.rows[0].id;
            if (sampul) await simpanSampul(db, bukuId, sampul);
            return bukuId;
        });

        return NextResponse.json({ pesan: `Buku "${data.judul}" ditambahkan`, id }, { status: 201 });
    } catch (error) {
        // 23505 = kode PostgreSQL untuk data ganda: kolom isbn bersifat UNIQUE
        if (error.code === '23505') {
            return NextResponse.json({ pesan: 'ISBN sudah terdaftar pada buku lain' }, { status: 409 });
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}