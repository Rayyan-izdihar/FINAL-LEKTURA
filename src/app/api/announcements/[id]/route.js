import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/announcements/5
// Detail satu pengumuman. Yang berstatus Draft dianggap tidak ada bagi pembaca publik.
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 });
        }

        const hasil = await query(
            `SELECT id, judul, isi, kategori, to_char(tanggal_rilis, 'YYYY-MM-DD') AS tanggal_rilis
            FROM announcements
            WHERE id = $1 AND status = 'Published'`,
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