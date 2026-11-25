import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';

// GET /api/pegawai/dashboard
// Semua data yang dibutuhkan bagian atas dashboard pegawai:
// angka ringkasan, antrean pengajuan pinjam, dan antrean pengajuan perpanjangan.
export async function GET() {
    try {
        const { sesi, error } = await cekAkses(['pegawai', 'admin']);
        if (error) return error;

        const ringkasan = await query(
            `SELECT
                (SELECT COUNT(*) FROM loans WHERE status = 'Menunggu Konfirmasi') AS menunggu,
                (SELECT COUNT(*) FROM loans
                  WHERE status = 'Sedang Dipinjam' AND status_perpanjangan = 'Diajukan') AS perpanjangan,
                (SELECT COUNT(*) FROM loans WHERE status = 'Sedang Dipinjam') AS aktif,
                -- sama dengan daftar di tab Denda: sudah tercatat tertunggak, atau masih dipinjam tetapi lewat jatuh tempo
                (SELECT COUNT(*) FROM loans
                  WHERE status_denda = 'Tertunggak'
                     OR (status = 'Sedang Dipinjam' AND CURRENT_DATE > tanggal_jatuh_tempo)) AS tertunggak`
        );


        // Pengajuan pinjam yang menunggu. Kolom `terblokir` memakai aturan yang sama
        // dengan mahasiswaTerblokir() di lib/peminjaman.js.
        const antreanPinjam = await query(
            `SELECT l.id, to_char(l.tanggal_pengajuan, 'YYYY-MM-DD') AS tanggal_pengajuan,
                    u.nama, u.nim,
                    b.id AS book_id, b.judul, b.penulis, b.sampul, b.stok_tersedia, b.maksimal_pinjam,
                    EXISTS (
                        SELECT 1 FROM loans x
                        WHERE x.user_id = l.user_id
                          AND (x.status_denda = 'Tertunggak'
                               OR (x.status = 'Sedang Dipinjam' AND CURRENT_DATE > x.tanggal_jatuh_tempo))
                    ) AS terblokir
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE l.status = 'Menunggu Konfirmasi'
             ORDER BY l.tanggal_pengajuan ASC, l.id ASC`
        );

        
        // Pengajuan perpanjangan. jatuh_tempo_baru = jatuh tempo sekarang + lama pinjam buku.
        const antreanPerpanjangan = await query(
            `SELECT l.id, u.nama, u.nim, b.judul, b.sampul, b.maksimal_pinjam,
                    l.alasan_perpanjangan,
                    to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS tanggal_jatuh_tempo,
                    to_char(l.tanggal_jatuh_tempo + b.maksimal_pinjam, 'YYYY-MM-DD') AS jatuh_tempo_baru,
                    to_char(l.tanggal_pengajuan_perpanjangan, 'YYYY-MM-DD') AS tanggal_pengajuan_perpanjangan,
                    GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) AS hari_terlambat
             FROM loans l
             JOIN users u ON u.id = l.user_id
             JOIN books b ON b.id = l.book_id
             WHERE l.status = 'Sedang Dipinjam' AND l.status_perpanjangan = 'Diajukan'
             ORDER BY l.tanggal_pengajuan_perpanjangan ASC, l.id ASC`
        );

        const baris = ringkasan.rows[0];
        return NextResponse.json({
            nama: sesi.nama,
            ringkasan: {
                menunggu: Number(baris.menunggu),
                perpanjangan: Number(baris.perpanjangan),
                aktif: Number(baris.aktif),
                tertunggak: Number(baris.tertunggak),
            },
            antrean_pinjam: antreanPinjam.rows,
            antrean_perpanjangan: antreanPerpanjangan.rows,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}