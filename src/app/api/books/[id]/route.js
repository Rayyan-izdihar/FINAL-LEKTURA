import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ambilSesi } from '@/lib/auth';
import { mahasiswaTerblokir } from '@/lib/peminjaman';

// GET /api/books/3
// Mengembalikan detail buku, daftar ulasan, dan status akses pengunjung yang sedang membuka
// (dipakai halaman detail untuk menentukan tombol "Ajukan Pinjam" aktif atau tidak).
export async function GET(request, { params }) {
    try {
        const { id } = await params; // di Next.js 16, params harus di-await
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Buku tidak ditemukan' }, { status: 404 });
        }

        const hasilBuku = await query(
            `SELECT b.id, b.judul, b.isbn, b.penulis, b.category_id, b.penerbit, b.tahun_terbit,
                    b.stok_total, b.stok_tersedia, b.maksimal_pinjam, b.denda_per_hari, b.sampul,
                    c.nama AS kategori
            FROM books b
            JOIN categories c ON c.id = b.category_id
            WHERE b.id = $1`,
            [id]
        );
        const baris = hasilBuku.rows[0];

        if (!baris) {
            return NextResponse.json({ pesan: 'Buku tidak ditemukan' }, { status: 404 });
        }
        const buku = { ...baris, denda_per_hari: Number(baris.denda_per_hari) };


        const hasilUlasan = await query(
            `SELECT r.id, r.rating, r.ulasan, to_char(r.tanggal_ulasan, 'YYYY-MM-DD') AS tanggal,
                    u.nama
            FROM reviews r
            JOIN loans l ON l.id = r.loan_id
            JOIN users u ON u.id = l.user_id
            WHERE l.book_id = $1
            ORDER BY r.tanggal_ulasan DESC`,
            [id]
        );
        const ulasan = hasilUlasan.rows;
        const rataRating =
            ulasan.length > 0 ? ulasan.reduce((total, u) => total + u.rating, 0) / ulasan.length : 0;


        // Status pengunjung: guest, atau user yang sudah login.
        const akses = { login: false, role: null, terblokir: false, sudahAda: false };
        const sesi = await ambilSesi();
        if (sesi) {
            akses.login = true;
            akses.role = sesi.role;

            if (sesi.role === 'mahasiswa') {
                akses.terblokir = await mahasiswaTerblokir(sesi.id);

                // Sudah mengajukan atau sedang meminjam buku yang sama?
                const sudah = await query(
                    `SELECT 1 FROM loans
                    WHERE user_id = $1 AND book_id = $2
                        AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
                    LIMIT 1`,
                    [sesi.id, id]
                );
                
                akses.sudahAda = sudah.rows.length > 0;
            }
        }

        return NextResponse.json({ buku, ulasan, rata_rating: rataRating, akses });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}