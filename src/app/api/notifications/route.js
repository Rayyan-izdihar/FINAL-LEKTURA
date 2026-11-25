import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { buatPengingatJatuhTempo } from '@/lib/pengingat';

// GET /api/notifications?page=1&limit=5
// Log notifikasi milik mahasiswa yang sedang login, yang terbaru di atas.
// Sebelum daftar diambil, pengingat H-1 dibuat dulu bila ada pinjaman yang jatuh tempo besok.
export async function GET(request) {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;

        await buatPengingatJatuhTempo(sesi.id);

        const { searchParams } = new URL(request.url);
        const halamanDiminta = Math.max(parseInt(searchParams.get('page')) || 1, 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 5, 1), 20);

        const hitung = await query(
            `SELECT COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE NOT dibaca)::int AS belum_dibaca
             FROM notifications
             WHERE user_id = $1`,
            [sesi.id]
        );
        const { total, belum_dibaca: belumDibaca } = hitung.rows[0];
        const totalHalaman = Math.max(Math.ceil(total / limit), 1);
        const halaman = Math.min(halamanDiminta, totalHalaman);

        // detik_lalu = berapa detik yang lalu notifikasi dibuat, diubah jadi teks "2 jam lalu" di browser
        const hasil = await query(
            `SELECT id, loan_id, tipe, pesan, dibaca,
                    FLOOR(EXTRACT(EPOCH FROM (NOW() - dibuat_pada)))::int AS detik_lalu
             FROM notifications
             WHERE user_id = $1
             ORDER BY dibuat_pada DESC, id DESC
             LIMIT $2 OFFSET $3`,
            [sesi.id, limit, (halaman - 1) * limit]
        );

        return NextResponse.json({
            notifikasi: hasil.rows,
            belum_dibaca: belumDibaca,
            pagination: { halaman, limit, total, totalHalaman },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}