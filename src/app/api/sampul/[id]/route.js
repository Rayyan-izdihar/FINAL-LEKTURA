import { query } from '@/lib/db';

// GET /api/sampul/5
// Mengirim gambar sampul buku yang tersimpan di database. Terbuka untuk umum, sama seperti katalog.
// Alamat selalu membawa ?v=<waktu>, jadi gambar aman disimpan lama di cache browser.
export async function GET(_request, { params }) {
    try {
        const { id } = await params;
        if (!Number.isInteger(Number(id))) return new Response('Sampul tidak ditemukan', { status: 404 });

        const hasil = await query('SELECT tipe, data FROM book_covers WHERE book_id = $1', [id]);
        if (hasil.rows.length === 0) return new Response('Sampul tidak ditemukan', { status: 404 });

        const { tipe, data } = hasil.rows[0];
        return new Response(data, {
            headers: {
                'Content-Type': tipe,
                'Content-Length': String(data.length),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error) {
        console.error(error);
        return new Response('Terjadi kesalahan pada server', { status: 500 });
    }
}