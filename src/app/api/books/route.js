import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { polaCari } from '@/lib/pencarian';

// Pilihan urutan. Teks SQL-nya dipilih dari daftar ini (bukan dari input pengguna langsung),
// jadi aman dari SQL injection.
const URUTAN = {
    judul: 'b.judul ASC, b.id ASC',
    tahun: 'b.tahun_terbit DESC, b.judul ASC, b.id ASC',
    rating: 'rata_rating DESC, jumlah_ulasan DESC, b.judul ASC, b.id ASC',
};

// GET /api/books?q=kata&kategori=2&urut=rating&page=1&limit=10
// Pagination bersifat opsional agar pemanggil API lama tetap kompatibel.
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = (searchParams.get('q') ?? '').trim();
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
            if (!Number.isInteger(Number(kategori)) || Number(kategori) < 1) {
                return NextResponse.json({ pesan: 'Kategori tidak valid' }, { status: 400 });
            }

            nilai.push(Number(kategori));
            syarat.push(`b.category_id = $${nilai.length}`);
        }

        const where = syarat.length > 0 ? `WHERE ${syarat.join(' AND ')}` : '';
        const memakaiPagination = searchParams.has('page') || searchParams.has('limit');
        const halamanDiminta = Number.parseInt(searchParams.get('page') ?? '1', 10);
        const limitDiminta = Number.parseInt(searchParams.get('limit') ?? '12', 10);

        if (memakaiPagination && (
            !Number.isInteger(halamanDiminta) || halamanDiminta < 1 ||
            !Number.isInteger(limitDiminta) || limitDiminta < 1 || limitDiminta > 50
        )) {
            return NextResponse.json({ pesan: 'Parameter halaman tidak valid' }, { status: 400 });
        }

        let pagination;
        let sqlPagination = '';
        if (memakaiPagination) {
            const hitung = await query(`SELECT COUNT(*)::int AS total FROM books b ${where}`, nilai);
            const total = hitung.rows[0].total;
            const totalHalaman = Math.ceil(total / limitDiminta);
            const halaman = Math.min(halamanDiminta, Math.max(totalHalaman, 1));
            const offset = (halaman - 1) * limitDiminta;
            sqlPagination = `LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`;
            pagination = { halaman, limit: limitDiminta, total, totalHalaman };
            nilai.push(limitDiminta, offset);
        }

        const hasil = await query(
            `SELECT b.id, b.judul, b.penulis, b.tahun_terbit, b.stok_total, b.stok_tersedia, b.sampul,
                    c.id AS kategori_id, c.nama AS kategori,
                    COALESCE(ROUND(AVG(r.rating), 1), 0) AS rata_rating,
                    COUNT(DISTINCT r.id)::int AS jumlah_ulasan
            FROM books b
            JOIN categories c ON c.id = b.category_id
            LEFT JOIN loans l ON l.book_id = b.id
            LEFT JOIN reviews r ON r.loan_id = l.id
            ${where}
            GROUP BY b.id, c.id
            ORDER BY ${urut}
            ${sqlPagination}`,
            nilai
        );

        const buku = hasil.rows.map((baris) => ({
            ...baris,
            rata_rating: Number(baris.rata_rating),
            jumlah_ulasan: Number(baris.jumlah_ulasan),
        }));

        return NextResponse.json(pagination ? { buku, pagination } : { buku });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}