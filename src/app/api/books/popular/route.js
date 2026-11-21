import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/books/popular
// 5 buku dengan transaksi peminjaman terbanyak (query agregasi JOIN + COUNT).
// Pengajuan yang masih menunggu atau ditolak tidak dihitung karena bukunya belum pernah dipinjam.
export async function GET() {
    try {
        const hasil = await query(
            `SELECT b.id, b.judul, b.penulis, b.sampul, c.nama AS kategori,
                    COUNT(l.id) AS jumlah_pinjam,
                    COALESCE(ROUND(AVG(r.rating), 1), 0) AS rata_rating
            FROM books b
            JOIN categories c ON c.id = b.category_id
            JOIN loans l ON l.book_id = b.id
            LEFT JOIN reviews r ON r.loan_id = l.id
            WHERE l.status IN ('Sedang Dipinjam', 'Selesai')
            GROUP BY b.id, c.id
            ORDER BY jumlah_pinjam DESC, rata_rating DESC, b.judul ASC
            LIMIT 5`
        );

        const buku = hasil.rows.map((baris) => ({
            ...baris,
            jumlah_pinjam: Number(baris.jumlah_pinjam),
            rata_rating: Number(baris.rata_rating),
        }));

        return NextResponse.json({ buku });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}