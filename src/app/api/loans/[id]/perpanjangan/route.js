import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';

// POST /api/loans/12/perpanjangan
// Body JSON: { "alasan": "..." } (alasan boleh kosong)
// Mahasiswa mengajukan perpanjangan. Status perpanjangan berubah menjadi 'Diajukan',
// lalu pegawai yang memutuskan setuju atau tolak (dibuat di bagian dashboard pegawai).
export async function POST(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;

        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Transaksi tidak ditemukan' }, { status: 404 });
        }

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }

        const body = await request.json().catch(() => null);
        const alasan = (body?.alasan ?? '').toString().trim().slice(0, 200) || null;


        const hasil = await query(
            `UPDATE loans
             SET status_perpanjangan = 'Diajukan',
                 tanggal_pengajuan_perpanjangan = CURRENT_DATE,
                 alasan_perpanjangan = $3
             WHERE id = $1
               AND user_id = $2
               AND status = 'Sedang Dipinjam'
               AND status_perpanjangan = 'Tidak Ada'
               AND CURRENT_DATE <= tanggal_jatuh_tempo
             RETURNING id`,
            [
                id, 
                sesi.id, 
                alasan
            ]
        );

        if (hasil.rows.length === 0) {
            const ada = await query(
                'SELECT 1 FROM loans WHERE id = $1 AND user_id = $2', 
                [
                    id,
                    sesi.id,
                ]
            );
            if (ada.rows.length === 0) {
                return NextResponse.json({ pesan: 'Transaksi tidak ditemukan' }, { status: 404 });
            }
            return NextResponse.json(
                {
                    pesan: 'Perpanjangan tidak dapat diajukan. Perpanjangan hanya bisa satu kali dan sebelum jatuh tempo.',
                },
                { status: 409 }
            );
        }

        return NextResponse.json({
            pesan: 'Pengajuan perpanjangan terkirim. Menunggu persetujuan pegawai.',
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}