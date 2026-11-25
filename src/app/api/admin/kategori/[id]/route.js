import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { validasiKategori } from '@/lib/validasiAdmin';

// POST /api/admin/kategori/3
// Mengubah nama, kode klasifikasi, atau deskripsi kategori.
export async function POST(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['admin']);
        if (error) return error;
        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }

        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Kategori tidak ditemukan' }, { status: 404 });
        }

        const body = await request.json().catch(() => null);
        const { data, pesan } = validasiKategori(body);
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        const hasil = await query(
            'UPDATE categories SET nama = $2, kode = $3, deskripsi = $4 WHERE id = $1 RETURNING id',
            [id, data.nama, data.kode, data.deskripsi]
        );
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Kategori tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: `Kategori ${data.nama} diperbarui` });
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