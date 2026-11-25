import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { validasiPengumuman } from '@/lib/validasiPegawai';

// GET /api/pegawai/pengumuman
// Semua pengumuman termasuk yang masih Draft (berbeda dengan /api/announcements yang hanya Published).
export async function GET() {
    try {
        const { error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        const hasil = await query(
            `SELECT a.id, a.judul, a.kategori, a.status,
                    to_char(a.tanggal_rilis, 'YYYY-MM-DD') AS tanggal_rilis,
                    LEFT(a.isi, 180) AS cuplikan,
                    u.nama AS penulis
             FROM announcements a
             JOIN users u ON u.id = a.author_id
             ORDER BY a.tanggal_rilis DESC, a.id DESC`
        );
        return NextResponse.json({ pengumuman: hasil.rows });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

// POST /api/pegawai/pengumuman
// Membuat pengumuman baru. Penulisnya dicatat dari akun yang sedang login.
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }


        const body = await request.json().catch(() => null);
        const { data, pesan } = validasiPengumuman(body);
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        
        // COALESCE: kalau tanggal rilis kosong, pakai tanggal hari ini
        const hasil = await query(
            `INSERT INTO announcements (judul, isi, kategori, tanggal_rilis, status, author_id)
             VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, $6)
             RETURNING id`,
            [data.judul, data.isi, data.kategori, data.tanggal_rilis, data.status, sesi.id]
        );

        return NextResponse.json(
            { pesan: `Pengumuman "${data.judul}" disimpan sebagai ${data.status}`, id: hasil.rows[0].id },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}