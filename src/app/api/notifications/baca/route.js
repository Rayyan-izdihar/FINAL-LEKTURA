import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';

// POST /api/notifications/baca
// Body JSON: { "id": 5 } menandai satu notifikasi, atau { "semua": true } menandai semuanya.
// Kondisi user_id = $1 memastikan mahasiswa hanya bisa mengubah notifikasi miliknya sendiri.
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;

        const body = await request.json().catch(() => null);

        if (body?.semua === true) {
            const hasil = await query(
                'UPDATE notifications SET dibaca = TRUE WHERE user_id = $1 AND NOT dibaca',
                [sesi.id]
            );
            return NextResponse.json({ pesan: `${hasil.rowCount} notifikasi ditandai sudah dibaca` });
        }

        const id = Number(body?.id);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ pesan: 'Notifikasi tidak valid' }, { status: 400 });
        }

        const hasil = await query(
            'UPDATE notifications SET dibaca = TRUE WHERE id = $1 AND user_id = $2',
            [id, sesi.id]
        );
        if (hasil.rowCount === 0) {
            return NextResponse.json({ pesan: 'Notifikasi tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: 'Notifikasi ditandai sudah dibaca' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}