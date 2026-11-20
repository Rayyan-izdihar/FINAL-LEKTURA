import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';


const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
    const body = await request.json().catch(() => null);
    const nama = body?.nama?.trim();
    const email = body?.email?.trim().toLowerCase();
    const nim = body?.nim?.trim();
    const password = body?.password;

    // --- Validasi ---
    if (!nama || !email || !nim || !password) {
        return NextResponse.json({ pesan: 'Semua data wajib diisi' }, { status: 400 });
    }
    if (!FORMAT_EMAIL.test(email)) {
        return NextResponse.json({ pesan: 'Format email tidak valid' }, { status: 400 });
    }
    if (!email.endsWith('.ac.id')) {
        return NextResponse.json({ pesan: 'Gunakan email kampus' },{ status: 400 });
    }
    if (password.length < 8) {
        return NextResponse.json({ pesan: 'Password minimal 8 karakter' }, { status: 400 });
    }

    // --- Cek email / NIM sudah dipakai ---
    const sudahAda = await query('SELECT email, nim FROM users WHERE email = $1 OR nim = $2', [
        email,
        nim,
    ]);
    if (sudahAda.rows.length > 0) {
        const emailSama = sudahAda.rows.some((baris) => baris.email === email);
        return NextResponse.json(
            { pesan: emailSama ? 'Email sudah terdaftar' : 'NIM sudah terdaftar' },
            { status: 409 }
        );
    }

    // --- Simpan. Password di-hash dulu, tidak pernah disimpan apa adanya. ---
    // Angka 10 = tingkat kesulitan hash (makin besar makin lambat dan makin aman).
    const passwordHash = await bcrypt.hash(password, 10);
    await query(
        `INSERT INTO users (nama, email, password_hash, nim, role)
        VALUES ($1, $2, $3, $4, 'mahasiswa')`,
        [nama, email, passwordHash, nim]
    );

    return NextResponse.json({ pesan: 'Pendaftaran berhasil, silakan login' }, { status: 201 });
}