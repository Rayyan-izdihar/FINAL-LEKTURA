import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { simpanSesi } from '@/lib/auth';


export async function POST(request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json(
            { pesan: 'Email dan password wajib diisi' }, 
            { status: 400 }
        );
    }

    const hasil = await query(
        'SELECT id, nama, email, password_hash, role, aktif FROM users WHERE email = $1',
        [email.trim().toLowerCase()]
    );
    const user = hasil.rows[0];


    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return NextResponse.json(
            { pesan: 'Email atau password salah' }, 
            { status: 401 }
        );
    }   

    if (!user.aktif) {
        return NextResponse.json(
            { pesan: 'Akun kamu dinonaktifkan. Hubungi admin perpustakaan.' },
            { status: 403 }
        );
    }

    await simpanSesi(user);

    return NextResponse.json({
        pesan: 'Login berhasil',
        user: { id: user.id, nama: user.nama, role: user.role },
        tujuan: `/dashboard/${user.role}`,
    });
}