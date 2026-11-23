import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { validasiBuku } from '@/lib/validasi';

// POST /api/pegawai/buku
// Menambah buku baru. Body JSON berisi semua isian formulir buku.
// Stok tersedia otomatis sama dengan stok total, karena buku baru belum dipinjam.
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }


        const body = await request.json().catch(() => null);
        const { data, pesan } = validasiBuku(body);

        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        
        const kategori = await query('SELECT 1 FROM categories WHERE id = $1', [data.category_id]);
        if (kategori.rows.length === 0) {
            return NextResponse.json({ pesan: 'Kategori tidak ditemukan' }, { status: 400 });
        }

        const hasil = await query(
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

        return NextResponse.json({ pesan: `Buku "${data.judul}" ditambahkan`, id: hasil.rows[0].id }, { status: 201 });
    } catch (error) {
        // 23505 = kode PostgreSQL untuk data ganda: kolom isbn bersifat UNIQUE
        if (error.code === '23505') {
            return NextResponse.json({ pesan: 'ISBN sudah terdaftar pada buku lain' }, { status: 409 });
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}