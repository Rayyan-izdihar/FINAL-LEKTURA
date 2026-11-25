import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { buatPengingatJatuhTempo } from '@/lib/pengingat';

// GET /api/notifications/jumlah
// Hanya jumlah notifikasi yang belum dibaca, untuk angka merah di ikon lonceng.
// Dibuat terpisah dari daftar lengkap supaya ringan, karena dipanggil di setiap halaman.
export async function GET() {
    try {
        const { sesi, error } = await cekAkses(['mahasiswa']);
        if (error) return error;

        await buatPengingatJatuhTempo(sesi.id);

        const hasil = await query(
            'SELECT COUNT(*)::int AS jumlah FROM notifications WHERE user_id = $1 AND NOT dibaca',
            [sesi.id]
        );
        return NextResponse.json({ belum_dibaca: hasil.rows[0].jumlah });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}