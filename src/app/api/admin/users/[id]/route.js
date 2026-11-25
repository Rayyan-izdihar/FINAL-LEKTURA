import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { validasiUser } from '@/lib/validasiAdmin';

// POST /api/admin/users/7
// Mengubah nama, email, peran, dan status aktif. NIM dan password tidak diubah di sini.
export async function POST(request, { params }) {
    try {
        const { sesi, error } = await cekAkses(['admin']);
        if (error) return error;
        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }

        
        const { id } = await params;
        if (!Number.isInteger(Number(id))) {
            return NextResponse.json({ pesan: 'Akun tidak ditemukan' }, { status: 404 });
        }

        const body = await request.json().catch(() => null);
        const { data, pesan } = validasiUser(body, { ubah: true });
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        // Mencegah admin mengunci dirinya sendiri dari sistem
        if (Number(id) === sesi.id && (!data.aktif || data.role !== 'admin')) {
            return NextResponse.json(
                { pesan: 'Kamu tidak dapat menonaktifkan atau menurunkan peran akunmu sendiri' },
                { status: 409 }
            );
        }

        const hasil = await query(
            `UPDATE users
             SET nama = $2, email = $3, role = $4, aktif = $5
             WHERE id = $1
             RETURNING id`,
            [id, data.nama, data.email, data.role, data.aktif]
        );
        if (hasil.rows.length === 0) {
            return NextResponse.json({ pesan: 'Akun tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ pesan: `Akun ${data.nama} diperbarui` });
    } catch (error) {
        if (error.code === '23505') {
            return NextResponse.json({ pesan: 'Email sudah dipakai akun lain' }, { status: 409 });
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}