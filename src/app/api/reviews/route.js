import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';

// POST /api/reviews
// Body JSON: { "loan_id": 12, "rating": 5, "ulasan": "..." } (ulasan boleh kosong)
// Ulasan hanya boleh untuk transaksi milik sendiri yang sudah berstatus Selesai.
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;


        const body = await request.json().catch(() => null);
        const loanId = Number(body?.loan_id);
        const rating = Number(body?.rating);
        const ulasan = (body?.ulasan ?? '').toString().trim().slice(0, 500) || null;

        if (!Number.isInteger(loanId) || loanId <= 0) {
            return NextResponse.json({ pesan: 'Transaksi tidak valid' }, { status: 400 });
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ pesan: 'Rating harus antara 1 sampai 5' }, { status: 400 });
        }

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }

        
        // INSERT ... SELECT: ulasan hanya tersimpan kalau transaksinya milik user ini dan sudah Selesai.
        const hasil = await query(
            `INSERT INTO reviews (loan_id, rating, ulasan)
             SELECT l.id, $3, $4
             FROM loans l
             WHERE l.id = $1 AND l.user_id = $2 AND l.status = 'Selesai'
             RETURNING id`,
            [
                loanId, 
                sesi.id, 
                rating, 
                ulasan
            ]
        );

        if (hasil.rows.length === 0) {
            const ada = await query(
                'SELECT 1 FROM loans WHERE id = $1 AND user_id = $2', 
                [
                    loanId,
                    sesi.id,
                ]
            );
            if (ada.rows.length === 0) {
                return NextResponse.json({ pesan: 'Transaksi tidak ditemukan' }, { status: 404 });
            }
            return NextResponse.json(
                { pesan: 'Ulasan hanya bisa ditulis setelah buku selesai dipinjam' },
                { status: 409 }
            );
        }

        return NextResponse.json({ pesan: 'Terima kasih, ulasanmu tersimpan' }, { status: 201 });
    } catch (error) {
        // 23505 = kode PostgreSQL untuk data ganda. Kolom loan_id di tabel reviews bersifat UNIQUE,
        // jadi satu transaksi hanya boleh punya satu ulasan.
        if (error.code === '23505') {
            return NextResponse.json(
                { pesan: 'Kamu sudah memberi ulasan untuk peminjaman ini' },
                { status: 409 }
            );
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}