import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/statistik
// Angka ringkas untuk beranda. Boleh dibuka tanpa login: isinya hanya jumlah, tanpa data pribadi.
export async function GET() {
    try {
        const hasil = await query(
            `SELECT
                (SELECT COUNT(*) FROM books)::int AS total_judul,
                (SELECT COUNT(*) FROM categories)::int AS total_kategori,
                (SELECT COUNT(*) FROM users WHERE role = 'mahasiswa' AND aktif = TRUE)::int AS total_mahasiswa,
                (SELECT COUNT(*) FROM loans WHERE status IN ('Sedang Dipinjam', 'Selesai'))::int AS total_peminjaman`
        );
        return NextResponse.json({ statistik: hasil.rows[0] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}