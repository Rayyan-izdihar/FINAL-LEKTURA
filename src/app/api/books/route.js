import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { polaCari } from '@/lib/pencarian';

// Pilihan urutan. Teks SQL-nya dipilih dari daftar ini (bukan dari input pengguna langsung),
// jadi aman dari SQL injection.
const URUTAN = {
    judul: 'b.judul ASC',
    tahun: 'b.tahun_terbit DESC, b.judul ASC',
    rating: 'rata_rating DESC, jumlah_ulasan DESC, b.judul ASC',
};

// GET /api/books?q=kata&kategori=2&urut=rating
// Semua parameter boleh dikosongkan.
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = (searchParams.get('q') ?? '');
        const kategori = searchParams.get('kategori') ?? '';
        // Object.hasOwn memastikan hanya pilihan di daftar URUTAN yang diterima
        const pilihanUrut = searchParams.get('urut');
        const urut = Object.hasOwn(URUTAN, pilihanUrut) ? URUTAN[pilihanUrut] : URUTAN.judul;

        // Syarat pencarian disusun satu per satu. Nilainya masuk ke daftar `nilai`
        // dan dipanggil di SQL lewat $1, $2, dst.
        const syarat = [];
        const nilai = [];

        if (q) {
            // Karakter % dan _ diberi garis miring agar dibaca apa adanya, bukan sebagai pola pencarian.
            nilai.push(polaCari(q));
            syarat.push(`(b.judul ILIKE $${nilai.length} OR b.penulis ILIKE $${nilai.length})`);
        }

        if (kategori) {
            if (!Number.isInteger(Number(kategori))) {
                return NextResponse.json({ pesan: 'Kategori tidak valid' }, { status: 400 });
            }

            nilai.push(Number(kategori));
            syarat.push(`b.category_id = $${nilai.length}`);
        }

        const where = syarat.length > 0 ? `WHERE ${syarat.join(' AND ')}` : '';

        const hasil = await query(
            `SELECT b.id, b.judul, b.penulis, b.tahun_terbit, b.stok_total, b.stok_tersedia, b.sampul,
                    c.id AS kategori_id, c.nama AS kategori,
                    COALESCE(ROUND(AVG(r.rating), 1), 0) AS rata_rating,
                    COUNT(r.id) AS jumlah_ulasan
            FROM books b
            JOIN categories c ON c.id = b.category_id
            LEFT JOIN loans l ON l.book_id = b.id
            LEFT JOIN reviews r ON r.loan_id = l.id
            ${where}
            GROUP BY b.id, c.id
            ORDER BY ${urut}`,
            nilai
        );

        // Postgres mengirim hasil AVG dan COUNT sebagai teks, jadi diubah ke angka dulu.
        const buku = hasil.rows.map((baris) => ({
            ...baris,
            rata_rating: Number(baris.rata_rating),
            jumlah_ulasan: Number(baris.jumlah_ulasan),
        }));

        return NextResponse.json({ buku });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}