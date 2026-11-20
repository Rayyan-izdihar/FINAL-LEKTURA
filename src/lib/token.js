// Membuat dan membaca token login (JWT).
// File ini sengaja TIDAK memakai database dan next/headers,
// sehingga aman di-import oleh proxy.js.
import { SignJWT, jwtVerify } from 'jose';

export const NAMA_COOKIE = 'lektura_session';
export const UMUR_SESI = 60 * 60 * 24; // 1 hari (dalam detik)

function ambilKunci() {
    const rahasia = process.env.JWT_SECRET;
    if (!rahasia) {
        throw new Error('JWT_SECRET belum diisi di .env.local');
    }
    
    return new TextEncoder().encode(rahasia);
}

// Isi token: data singkat user. Ditandatangani dengan JWT_SECRET,
// jadi kalau isinya diubah orang lain, token otomatis tidak valid.
export async function buatToken(user) {
    return new SignJWT({ id: user.id, nama: user.nama, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${UMUR_SESI}s`)
        .sign(ambilKunci());
}

// Mengembalikan isi token jika valid, atau null jika palsu/kedaluwarsa.
export async function bacaToken(token) {
    try {
        const { payload } = await jwtVerify(token, ambilKunci());
        return payload;
    } catch {
        return null;
    }
}