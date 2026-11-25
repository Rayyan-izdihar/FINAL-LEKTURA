import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';

// POST /api/admin/kategori/3/hapus
// Menghapus kategori. Ditolak kalau masih ada buku yang memakai kategori itu.
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

        const dipakai = await query('SELECT COUNT(*)::int AS jumlah FROM books WHERE category_id = $1', [id]);
        if (dipakai.rows[0].jumlah > 0) {
            return NextResponse.json(
                { pesan: `Kategori masih dipakai ${dipakai.rows[0].jumlah} buku. Pindahkan atau hapus bukunya dulu.` },
                { status: 409 }
            );
        }

        const hasil = await query('DELETE FROM categories WHERE id = $1 RETURNING nama', [id]);
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Kategori tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: `Kategori ${hasil.rows[0].nama} dihapus` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}