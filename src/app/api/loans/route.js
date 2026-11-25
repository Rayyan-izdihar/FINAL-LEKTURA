import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif, mahasiswaTerblokir } from '@/lib/peminjaman';

// GET /api/loans
// Semua transaksi milik mahasiswa yang sedang login, beserta ringkasan denda.
export async function GET() {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;

        const hasil = await query(
            `SELECT l.id, l.book_id, b.judul, b.penulis, b.sampul, b.denda_per_hari,
                    l.status, l.alasan_penolakan,
                    l.status_perpanjangan, l.alasan_perpanjangan,
                    l.status_denda, l.jumlah_denda,
                    b.stok_tersedia,
                    to_char(l.tanggal_pengajuan, 'YYYY-MM-DD') AS tanggal_pengajuan,
                    to_char(l.tanggal_pinjam, 'YYYY-MM-DD') AS tanggal_pinjam,
                    to_char(l.tanggal_jatuh_tempo, 'YYYY-MM-DD') AS tanggal_jatuh_tempo,
                    to_char(l.tanggal_kembali, 'YYYY-MM-DD') AS tanggal_kembali,
                    -- sisa hari sampai jatuh tempo (negatif kalau sudah lewat)
                    l.tanggal_jatuh_tempo - CURRENT_DATE AS sisa_hari,
                    -- jumlah hari keterlambatan (dihitung saat ini untuk pinjaman aktif,
                    -- atau saat dikembalikan untuk pinjaman selesai)
                    CASE
                        WHEN l.status = 'Sedang Dipinjam'
                            THEN GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0)
                        WHEN l.status = 'Selesai'
                            THEN GREATEST(l.tanggal_kembali - l.tanggal_jatuh_tempo, 0)
                        ELSE 0
                    END AS hari_terlambat,
                    (l.status = 'Sedang Dipinjam'
                        AND l.status_perpanjangan = 'Tidak Ada'
                        AND CURRENT_DATE <= l.tanggal_jatuh_tempo) AS bisa_diperpanjang,
                    EXISTS (SELECT 1 FROM reviews r WHERE r.loan_id = l.id) AS sudah_diulas
             FROM loans l
             JOIN books b ON b.id = l.book_id
             WHERE l.user_id = $1
             ORDER BY l.tanggal_pengajuan DESC, l.id DESC`,
            [sesi.id]
        );

        // Denda dihitung di sini: pinjaman aktif = hari terlambat x tarif per hari,
        // pinjaman selesai = nominal yang sudah tersimpan saat pengembalian.
        const pinjaman = hasil.rows.map((baris) => {
            const tarif = Number(baris.denda_per_hari);
            let denda = 0;
            if (baris.status === 'Sedang Dipinjam') denda = baris.hari_terlambat * tarif;
            if (baris.status === 'Selesai') denda = Number(baris.jumlah_denda);
            return {
                ...baris,
                denda_per_hari: tarif,
                denda,
            };
        });

        // Transaksi yang menjadi penyebab blokir, untuk kartu peringatan denda
        const rincianDenda = pinjaman
            .filter(
                (p) =>
                    p.status_denda === 'Tertunggak' ||
                    (p.status === 'Sedang Dipinjam' && p.hari_terlambat > 0)
            )
            .map((p) => ({
                id: p.id,
                judul: p.judul,
                hari_terlambat: p.hari_terlambat,
                denda: p.denda,
            }));
        const totalDenda = rincianDenda.reduce((total, r) => total + r.denda, 0);

        return NextResponse.json({
            nama: sesi.nama,
            pinjaman,
            ringkasan: {
                terblokir: await mahasiswaTerblokir(sesi.id),
                total_denda: totalDenda,
                rincian_denda: rincianDenda,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}


// POST /api/loans
// Body JSON: { "book_id": 3 }
// Mahasiswa mengajukan peminjaman. Status awal: Menunggu Konfirmasi.
// Stok baru berkurang saat pegawai menyetujui, bukan saat pengajuan.
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;


        const body = await request.json().catch(() => null);
        const bukuId = Number(body?.book_id);

        if (!Number.isInteger(bukuId) || bukuId <= 0) {
            return NextResponse.json({ pesan: 'Buku tidak valid' }, { status: 400 });
        }

        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }


        const hasilBuku = await query(
            'SELECT judul, stok_tersedia FROM books WHERE id = $1', 
            [bukuId]
        );
        const buku = hasilBuku.rows[0];
        if (!buku) {
            return NextResponse.json({ pesan: 'Buku tidak ditemukan' }, { status: 404 });
        }

        if (await mahasiswaTerblokir(sesi.id)) {
            return NextResponse.json(
                { pesan: 'Pengajuan diblokir karena kamu masih punya denda tertunggak' },
                { status: 403 }
            );
        }


        const sudahAda = await query(
            `SELECT 1 FROM loans
             WHERE user_id = $1 AND book_id = $2
               AND status IN ('Menunggu Konfirmasi', 'Sedang Dipinjam')
             LIMIT 1`,
            [
                sesi.id, 
                bukuId
            ]
        );
        if (sudahAda.rows.length > 0) {
            return NextResponse.json(
                { pesan: 'Kamu sudah mengajukan atau sedang meminjam buku ini' },
                { status: 409 }
            );
        }

        if (buku.stok_tersedia <= 0) {
            return NextResponse.json({ pesan: 'Stok buku sedang habis' }, { status: 409 });
        }

        
        const hasil = await query(
            'INSERT INTO loans (user_id, book_id) VALUES ($1, $2) RETURNING id',
            [sesi.id, bukuId]
        );

        return NextResponse.json(
            {
                pesan: `Pengajuan pinjam "${buku.judul}" terkirim. Datang ke meja sirkulasi untuk verifikasi.`,
                id: hasil.rows[0].id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}