import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';

// POST /api/pegawai/pengumuman/5/hapus
// Menghapus pengumuman yang sudah usang atau tidak relevan.
export async function POST(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;
        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }


        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 });
        }

        const hasil = await query(
            'DELETE FROM announcements WHERE id = $1 RETURNING judul', 
            [id]
        );
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: `Pengumuman "${hasil.rows[0].judul}" dihapus` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}