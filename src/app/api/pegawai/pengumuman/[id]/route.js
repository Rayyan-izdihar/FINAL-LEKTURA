import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { validasiPengumuman } from '@/lib/validasi';

// GET /api/pegawai/pengumuman/5
// Satu pengumuman lengkap (termasuk Draft), untuk mengisi formulir edit.
export async function GET(request, { params }) {
    try {
        const { error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        
        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 });
        }

        const hasil = await query(
            `SELECT id, judul, isi, kategori, status, to_char(tanggal_rilis, 'YYYY-MM-DD') AS tanggal_rilis
             FROM announcements
             WHERE id = $1`,
            [id]
        );
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 });
        }
        return NextResponse.json({ pengumuman: hasil.rows[0] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

// POST /api/pegawai/pengumuman/5
// Mengubah judul, isi, kategori, tanggal rilis, atau status pengumuman.
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

        const body = await request.json().catch(() => null);
        const { data, pesan } = validasiPengumuman(body);
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        // Pada edit, tanggal yang dikosongkan tetap memakai tanggal rilis yang lama
        const hasil = await query(
            `UPDATE announcements
             SET judul = $2, isi = $3, kategori = $4,
                 tanggal_rilis = COALESCE($5::date, tanggal_rilis), status = $6
             WHERE id = $1
             RETURNING id`,
            [id, data.judul, data.isi, data.kategori, data.tanggal_rilis, data.status]
        );
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: `Pengumuman "${data.judul}" diperbarui` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}