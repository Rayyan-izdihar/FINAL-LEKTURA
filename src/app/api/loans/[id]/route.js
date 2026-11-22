import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';

// GET /api/loans/12
// Satu transaksi milik mahasiswa yang sedang login (dipakai halaman tulis ulasan).
// Transaksi milik orang lain dijawab "tidak ditemukan", bukan "dilarang",
// supaya orang luar tidak bisa menebak nomor transaksi yang ada.
export async function GET(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;

        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Transaksi tidak ditemukan' }, { status: 404 });
        }

        const hasil = await query(
            `SELECT l.id, l.status,
                    to_char(l.tanggal_kembali, 'YYYY-MM-DD') AS tanggal_kembali,
                    b.id AS book_id, b.judul, b.penulis, b.sampul,
                    EXISTS (SELECT 1 FROM reviews r WHERE r.loan_id = l.id) AS sudah_diulas
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.id = $1 AND l.user_id = $2`,
            [id, sesi.id]
        );
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Transaksi tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pinjaman: hasil.rows[0] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}