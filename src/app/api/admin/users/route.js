import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { cekAkses } from '@/lib/auth';
import { akunAktif } from '@/lib/peminjaman';
import { polaCari } from '@/lib/pencarian';
import { DAFTAR_ROLE, validasiUser } from '@/lib/validasiAdmin';

// GET /api/admin/users?role=mahasiswa&q=kata&page=1&limit=10
// Daftar akun dengan filter peran, pencarian (nama, email, NIM), dan paginasi.
export async function GET(request) {
    try {
        const { sesi, error } = await cekAkses(['admin']);
        if (error) return error;

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') ?? '';
        const q = searchParams.get('q') ?? '';
        const halamanDiminta = Math.max(parseInt(searchParams.get('page')) || 1, 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 10, 1), 50);

        const syarat = [];
        const nilai = [];
        if (DAFTAR_ROLE.includes(role)) {
            nilai.push(role);
            syarat.push(`u.role = $${nilai.length}`);
        }
        if (q.trim()) {
            nilai.push(polaCari(q));
            syarat.push(
                `(u.nama ILIKE $${nilai.length} OR u.email ILIKE $${nilai.length} OR u.nim ILIKE $${nilai.length})`
            );
        }
        const where = syarat.length > 0 ? `WHERE ${syarat.join(' AND ')}` : '';

        const hitung = await query(`SELECT COUNT(*)::int AS total FROM users u ${where}`, nilai);
        const total = hitung.rows[0].total;
        const totalHalaman = Math.max(Math.ceil(total / limit), 1);
        const halaman = Math.min(halamanDiminta, totalHalaman);

        const hasil = await query(
            `SELECT u.id, u.nama, u.email, u.nim, u.role, u.aktif
             FROM users u
             ${where}
             ORDER BY 
                    CASE u.role
                        WHEN 'admin' THEN 1
                        WHEN 'pegawai' THEN 2
                        WHEN 'mahasiswa' THEN 3
                        ELSE 4
                    END ASC, 
                u.nama ASC, u.id ASC
             LIMIT $${nilai.length + 1} OFFSET $${nilai.length + 2}`,
            [...nilai, limit, (halaman - 1) * limit]
        );

        // Jumlah akun per peran (tidak terpengaruh filter) untuk angka di tombol filter
        const perRole = await query('SELECT role, COUNT(*)::int AS jumlah FROM users GROUP BY role');
        const jumlahPerRole = { admin: 0, pegawai: 0, mahasiswa: 0 };
        perRole.rows.forEach((baris) => {
            jumlahPerRole[baris.role] = baris.jumlah;
        });

        return NextResponse.json({
            users: hasil.rows,
            saya: sesi.id,
            jumlah_per_role: jumlahPerRole,
            pagination: { halaman, limit, total, totalHalaman },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

// POST /api/admin/users
// Menambah akun. Body JSON: { nama, email, nim, password, role }
export async function POST(request) {
    try {
        const { sesi, error } = await cekAkses(['admin']);
        if (error) return error;
        if (!(await akunAktif(sesi.id))) {
            return NextResponse.json({ pesan: 'Akun kamu dinonaktifkan' }, { status: 403 });
        }

        const body = await request.json().catch(() => null);
        const { data, pesan } = validasiUser(body);
        if (pesan) return NextResponse.json({ pesan }, { status: 400 });

        // Password di-hash dulu, tidak pernah disimpan apa adanya
        const passwordHash = await bcrypt.hash(data.password, 10);
        const hasil = await query(
            `INSERT INTO users (nama, email, password_hash, nim, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [data.nama, data.email, passwordHash, data.nim, data.role]
        );

        return NextResponse.json({ pesan: `Akun ${data.nama} ditambahkan`, id: hasil.rows[0].id }, { status: 201 });
    } catch (error) {
        // 23505 = data ganda. error.constraint berisi nama aturan UNIQUE yang dilanggar.
        if (error.code === '23505') {
            const nomorIdentitas = error.constraint?.includes('nim');
            return NextResponse.json(
                { pesan: nomorIdentitas ? 'Nomor identitas sudah dipakai akun lain' : 'Email sudah dipakai akun lain' },
                { status: 409 }
            );
        }
        console.error(error);
        return NextResponse.json({ pesan: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}