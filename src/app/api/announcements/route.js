import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/announcements?limit=2
// Pengumuman berstatus Published, yang terbaru di atas.
// Tanggal diubah jadi teks 'YYYY-MM-DD' lewat to_char agar tidak terpengaruh zona waktu.
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const batas = Math.min(Math.max(parseInt(searchParams.get('limit')) || 50, 1), 50);

        const hasil = await query(
            `SELECT id, judul, kategori,
                    to_char(tanggal_rilis, 'YYYY-MM-DD') AS tanggal_rilis,
                    LEFT(isi, 220) AS cuplikan
            FROM announcements
            WHERE status = 'Published'
            ORDER BY tanggal_rilis DESC, id DESC
            LIMIT $1`,
            [batas]
        );

        const kategori = await query(
            `SELECT kategori, COUNT(id) as jumlah
            FROM announcements
            WHERE status = 'Published'
            GROUP BY kategori
            ORDER BY kategori ASC`
        )

        return NextResponse.json({ pengumuman: hasil.rows, kategori: kategori.rows });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}