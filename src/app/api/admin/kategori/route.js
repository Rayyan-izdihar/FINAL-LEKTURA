import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { validasiKategori } from '@/lib/validasiAdmin';

// GET /api/admin/kategori
// Semua kategori beserta jumlah buku di dalamnya.
export async function GET() {
    try {
        const { error } = await cekAkses(['admin']);
        if (error) return error;

        const hasil = await query(
            `SELECT c.id, c.nama, c.kode, c.deskripsi, COUNT(b.id)::int AS total_buku
             FROM categories c
             LEFT JOIN books b ON b.category_id = c.id
             GROUP BY c.id
             ORDER BY c.nama ASC`
        );
        return NextResponse.json({ kategori: hasil.rows });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

// POST /api/admin/kategori
// Menambah kategori. Body JSON: { nama, kode, deskripsi }
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['admin']);
        if (error) return error;
        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }

        const body = await request.json().catch(() => null);
        const { data, pesan } = validasiKategori(body);
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        const hasil = await query(
            'INSERT INTO categories (nama, kode, deskripsi) VALUES ($1, $2, $3) RETURNING id',
            [data.nama, data.kode, data.deskripsi]
        );

        return NextResponse.json({ pesan: `Kategori ${data.nama} ditambahkan`, id: hasil.rows[0].id }, { status: 201 });
    } catch (error) {
        if (error.code === '23505') {
            const kode = error.constraint?.includes('kode');
            return NextResponse.json(
                { pesan: kode ? 'Kode kategori sudah dipakai' : 'Nama kategori sudah dipakai' },
                { status: 409 }
            );
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}